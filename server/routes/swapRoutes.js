import express from 'express';
import { proposeSwap, getUserSwaps } from '../controllers/swapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, proposeSwap)
  .get(protect, getUserSwaps);

export default router;
