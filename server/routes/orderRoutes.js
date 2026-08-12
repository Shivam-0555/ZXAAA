import express from 'express';
import { createOrder, verifyQR } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder);

router.route('/verify-qr')
  .post(protect, verifyQR);

export default router;
