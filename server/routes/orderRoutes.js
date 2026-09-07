import express from 'express';
import { createOrder, verifyQR, getMyOrders, getOrderById, completeUpiPayment, acceptOrder, markPickupReady, declineOrder, cancelOrder } from '../controllers/orderController.js';
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

router.route('/:id/accept')
  .put(protect, acceptOrder);

router.route('/:id/decline')
  .put(protect, declineOrder);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

router.route('/:id/pickup-ready')
  .put(protect, markPickupReady);

router.route('/:id')
  .get(protect, getOrderById);

export default router;
