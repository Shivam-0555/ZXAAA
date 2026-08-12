import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Swap from '../models/Swap.js';

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'ACTIVE' });
    const orderCount = await Order.countDocuments();
    const swapCount = await Swap.countDocuments();

    // Calculate total revenue from completed orders
    const completedOrders = await Order.find({ orderStatus: 'COMPLETED' });
    const totalRevenue = completedOrders.reduce((sum, ord) => sum + (ord.amount || 0), 0);

    res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        activeProducts,
        orders: orderCount,
        swaps: swapCount,
        revenue: totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users for Admin
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products for Admin
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('seller', 'name email trustScore')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product status (ACTIVE / RESERVED / SOLD / REJECTED)
// @route   PATCH /api/admin/products/:id/status
// @access  Private/Admin
export const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.status = status;
    await product.save();
    res.json({ success: true, data: product, message: `Product status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (user <-> admin)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json({ success: true, data: user, message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
