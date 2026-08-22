import express from 'express';
import { getMessages, sendMessage, getUserConversations } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, sendMessage);

router.route('/conversations')
  .get(protect, getUserConversations);

router.route('/:receiverId/:productId')
  .get(protect, getMessages);

export default router;
