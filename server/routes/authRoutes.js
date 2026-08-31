import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  elevateToAdmin,
  googleLogin,
  requestOtp,
  verifyOtpLogin,
  verifyResetOtp,
  resetPassword,
  getUpiDetails,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/elevate-admin', protect, elevateToAdmin);

// New Routes for Google Login, Mobile OTP, and Password Reset
router.post('/google', googleLogin);
router.post('/request-otp', requestOtp);
router.post('/verify-otp-login', verifyOtpLogin);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// UPI Details (buyer fetches seller's UPI ID to build payment QR)
router.get('/upi/:userId', protect, getUpiDetails);

export default router;

