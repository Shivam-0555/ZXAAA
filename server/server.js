import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { checkAndExpireOrders } from './utils/expirationTask.js';
import http from 'http';
import { Server } from 'socket.io';

// Basic Route
app.get('/', (req, res) => {
  res.send('ZXAAA API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reports', reportRoutes);

// Database Connection & Automated Background Job
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zxaaa')
  .then(() => {
    console.log('MongoDB connected');
    // Run order expiration check immediately and then every 60 seconds
    checkAndExpireOrders();
    setInterval(checkAndExpireOrders, 60 * 1000);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join_room', (room) => {
    socket.join(room);
  });
  
  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
