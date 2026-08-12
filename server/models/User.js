import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      default: 50, // Starts at 50/100
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalListings: {
      type: Number,
      default: 0,
    },
    productsSold: {
      type: Number,
      default: 0,
    },
    productsBought: {
      type: Number,
      default: 0,
    },
    swapsCompleted: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number, // in minutes
      default: 0,
    },
    twoHourResponseRate: {
      type: Number, // percentage
      default: 100,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    walletPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create geospatial index
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
export default User;
