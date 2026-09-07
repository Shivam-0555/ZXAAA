import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/toggle', protect, toggleWishlist);
router.get('/', protect, getWishlist);

export default router;
