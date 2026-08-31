import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createNotificationInternal } from './notificationController.js';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, city, latitude, longitude } = req.body;

    if (!name || !email || !phone || !password || !city) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const phoneExists = await User.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists' });
    }

    const referralCode = `ZX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      city: city.trim(),
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 73.1812, parseFloat(latitude) || 22.3072],
      },
      referralCode,
    });

    if (user) {
      // Create Welcome Notification
      await createNotificationInternal({
        user: user._id,
        type: 'system',
        title: 'Welcome to ZXAAA Marketplace! 🎉',
        message: 'Your account is ready. Explore products or list your first item to start trading.',
        link: '/explore'
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          trustScore: user.trustScore,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ success: false, message: `An account with this ${field} already exists` });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          trustScore: user.trustScore,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    // UPI ID — validate format before saving
    if (req.body.upiId !== undefined) {
      const upiVal = req.body.upiId.trim();
      if (upiVal && !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiVal)) {
        return res.status(400).json({ success: false, message: 'Invalid UPI ID format. Expected: yourname@bankname' });
      }
      user.upiId = upiVal;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        city: updatedUser.city,
        profileImage: updatedUser.profileImage,
        trustScore: updatedUser.trustScore,
        role: updatedUser.role,
        upiId: updatedUser.upiId,
        token: generateToken(updatedUser._id),
      },
      message: 'Profile updated successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Elevate logged in user to admin role (Developer/Admin setup)
// @route   POST /api/auth/elevate-admin
// @access  Private
export const elevateToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.role = 'admin';
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
      message: 'Admin access granted!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    let payload;

    // For testing without a real client ID, we can optionally bypass verification if a mock token is sent,
    // but typically we verify using the library:
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      });
      payload = ticket.getPayload();
    } catch (err) {
      // For development, if we can't verify, we might reject, or we can mock it if needed.
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, name, sub: googleId } = payload;
    
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if they don't exist
      const referralCode = `ZX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      user = await User.create({
        name,
        email,
        googleId,
        referralCode,
        isVerified: true
      });
      
      await createNotificationInternal({
        user: user._id,
        type: 'system',
        title: 'Welcome to ZXAAA Marketplace via Google! 🎉',
        message: 'Your account is ready. Explore products or list your first item to start trading.',
        link: '/explore'
      });
    } else if (!user.googleId) {
      // Link Google ID if user exists with email but no Google ID
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        trustScore: user.trustScore,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Request OTP (for Login or Forgot Password)
// @route   POST /api/auth/request-otp
// @access  Public
export const requestOtp = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be email or phone
    
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number' });
    }

    // Find user by email or phone
    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }] 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email or phone number' });
    }

    const otp = generateOTP();
    // Expiration set to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Mock sending OTP — in production replace with SMS/Email provider (e.g. Twilio, SendGrid)
    console.log(`[DEV ONLY] OTP for ${identifier}: ${otp}`);

    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: 'OTP sent successfully',
      ...(isDev && { devOtp: otp }) // Only sent in dev mode for testing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP for Login
// @route   POST /api/auth/verify-otp-login
// @access  Public
export const verifyOtpLogin = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }] 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        trustScore: user.trustScore,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP for Reset Password
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }] 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.json({ success: true, message: 'OTP verified, you may now reset your password' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
       return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }] 
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // We verify OTP again for security
    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Set new password and clear OTP
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get UPI details for a seller (used by buyer to build UPI QR)
// @route   GET /api/auth/upi/:userId
// @access  Private (authenticated buyers)
export const getUpiDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.userId).select('name upiId');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    // Only expose upiId and name — never password, OTP, or other PII
    res.json({
      success: true,
      data: {
        name: seller.name,
        upiId: seller.upiId || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
