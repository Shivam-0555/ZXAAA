import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  updateUserRole,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/products', protect, admin, getAllProducts);

router.patch('/products/:id/status', protect, admin, updateProductStatus);
router.delete('/products/:id', protect, admin, deleteProduct);

router.patch('/users/:id/role', protect, admin, updateUserRole);

export default router;
