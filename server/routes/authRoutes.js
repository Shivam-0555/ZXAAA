import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, elevateToAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/elevate-admin', protect, elevateToAdmin);

export default router;
