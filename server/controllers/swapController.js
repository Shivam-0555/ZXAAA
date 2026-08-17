import Swap from '../models/Swap.js';
import Product from '../models/Product.js';
import { createNotificationInternal } from './notificationController.js';

// @desc    Propose a new swap
// @route   POST /api/swaps
// @access  Private
export const proposeSwap = async (req, res) => {
  try {
    const { proposerProductId, receiverProductId, priceDifference, priceDifferencePaidBy } = req.body;
    const proposerId = req.user._id;

    const proposerProduct = await Product.findById(proposerProductId);
    const receiverProduct = await Product.findById(receiverProductId);

    if (!proposerProduct || !receiverProduct) {
      return res.status(404).json({ success: false, message: 'Products not found' });
    }

    if (proposerProduct.seller.toString() !== proposerId.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own the proposed product' });
    }

    const swap = new Swap({
      proposer: proposerId,
      receiver: receiverProduct.seller,
      proposerProduct: proposerProductId,
      receiverProduct: receiverProductId,
      priceDifference: priceDifference || 0,
      priceDifferencePaidBy: priceDifferencePaidBy || 'NONE',
    });

    const createdSwap = await swap.save();

    // Send Swap Request Notification to Receiver
    await createNotificationInternal({
      user: receiverProduct.seller,
      type: 'swap',
      title: 'Swap Request Received! 🔄',
      message: `${req.user.name || 'A user'} proposed to swap "${proposerProduct.title}" with your "${receiverProduct.title}".`,
      link: '/swap'
    });

    res.status(201).json({ success: true, data: createdSwap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's swap proposals
// @route   GET /api/swaps
// @access  Private
export const getUserSwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ proposer: req.user._id }, { receiver: req.user._id }]
    })
    .populate('proposerProduct')
    .populate('receiverProduct')
    .populate('proposer', 'name')
    .populate('receiver', 'name')
    .sort({ createdAt: -1 });

    res.json({ success: true, count: swaps.length, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
