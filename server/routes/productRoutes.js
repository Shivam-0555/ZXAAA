import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getSuggestions } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.get('/search/suggestions', getSuggestions);

router.route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
