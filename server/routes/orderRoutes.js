import express from 'express';
import { createOrder, verifyQR, getMyOrders, getOrderById, completeUpiPayment } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder);

// Must come BEFORE /:id to avoid "myorders" being treated as an ID
router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/verify-qr')
  .post(protect, verifyQR);

router.route('/complete-upi')
  .post(protect, completeUpiPayment);


router.route('/:id')
  .get(protect, getOrderById);

export default router;
