import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zxaaa');
    console.log('MongoDB connected for seeding...');

    // Clear existing
    await User.deleteMany();
    await Product.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@zxaaa.com',
      password: 'admin123',
      phone: '9876543210',
      city: 'Vadodara',
      role: 'admin',
      trustScore: 100,
      referralCode: 'ADMINREF',
      location: {
        type: 'Point',
        coordinates: [73.1812, 22.3072] // Vadodara
      }
    });

    // Create Standard User
    const standardUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      phone: '1234567890',
      city: 'Vadodara',
      trustScore: 85,
      referralCode: 'JOHNREF',
      location: {
        type: 'Point',
        coordinates: [73.1812, 22.3072] 
      }
    });

    // Create Products
    await Product.create({
      title: 'Sony WH-1000XM4',
      description: 'Barely used noise cancelling headphones. Mint condition.',
      price: 15000,
      category: 'Electronics',
      condition: 'Like New',
      images: ['https://via.placeholder.com/400'],
      seller: standardUser._id,
      status: 'ACTIVE',
      city: 'Vadodara',
      location: {
        type: 'Point',
        coordinates: [73.1812, 22.3072]
      }
    });

    await Product.create({
      title: 'Vintage Leather Jacket',
      description: 'Classic brown leather jacket. Size M.',
      price: 2500,
      category: 'Clothing',
      condition: 'Good',
      images: ['https://via.placeholder.com/400'],
      seller: admin._id,
      status: 'ACTIVE',
      city: 'Vadodara',
      location: {
        type: 'Point',
        coordinates: [73.1812, 22.3072]
      }
    });

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
