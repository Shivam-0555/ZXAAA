// Local development entry point — runs Express + Socket.io on a real port.
// Vercel uses api/index.js instead.

import app, { connectDB } from './server.js';
import { checkAndExpireOrders } from './utils/expirationTask.js';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
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

connectDB().then(() => {
  // Run order expiration check immediately and then every 60 seconds
  checkAndExpireOrders();
  setInterval(checkAndExpireOrders, 60 * 1000);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
