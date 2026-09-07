import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc Toggle item in wishlist (add/remove)
// @route POST /api/wishlist/toggle
// @access Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await Wishlist.findOne({ user: userId, product: productId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      // Remove user from watchers
      await Product.findByIdAndUpdate(productId, { $pull: { watchers: userId } });
      return res.json({ success: true, isSaved: false, message: 'Removed from saved items' });
    } else {
      await Wishlist.create({ user: userId, product: productId });
      // Add user to watchers for price drop alerts
      await Product.findByIdAndUpdate(productId, { $addToSet: { watchers: userId } });
      return res.json({ success: true, isSaved: true, message: 'Added to saved items' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user wishlist
// @route GET /api/wishlist
// @access Private
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: 'product',
        populate: { path: 'seller', select: 'name trustScore isVerified profileImage city' }
      })
      .sort({ createdAt: -1 });

    const products = wishlistItems
      .map((item) => item.product)
      .filter((p) => p !== null && p !== undefined);

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
