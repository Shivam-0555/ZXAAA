import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import crypto from 'crypto';
import { createNotificationInternal } from './notificationController.js';

// @desc    Create a new order (Purchase Request)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { productId, paymentMethod, isEmergency, emergencyCharge, meetupPoint, meetupTime } = req.body;
    const buyerId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Product is not available for purchase' });
    }

    if (product.seller.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot buy your own product' });
    }

    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const qrReference = `ZX-TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const now = new Date();

    // Emergency purchase backend validation
    const emergencyFlag = Boolean(isEmergency);
    const validEmergencyCharge = emergencyFlag ? Number(emergencyCharge || 100) : 0;
    const amount = Number(product.price);
    const finalAmount = amount + validEmergencyCharge;

    const order = new Order({
      orderId,
      buyer: buyerId,
      seller: product.seller,
      product: productId,
      amount,
      isEmergency: emergencyFlag,
      emergencyCharge: validEmergencyCharge,
      finalAmount,
      meetupPoint: meetupPoint || '',
      meetupTime: meetupTime || '',
      paymentMethod,
      qrReference,
      timeline: {
        orderCreated: { status: 'completed', timestamp: now },
        sellerNotified: { status: 'completed', timestamp: now },
        sellerResponsePending: { status: 'current', timestamp: now },
        sellerAccepted: { status: 'pending' },
        paymentConfirmed: { status: 'pending' },
        pickupReady: { status: 'pending' },
        qrVerified: { status: 'pending' },
        orderCompleted: { status: 'pending' },
      },
    });

    const createdOrder = await order.save();

    // Change product status to RESERVED
    product.status = 'RESERVED';
    await product.save();

    // Send Real Notifications to Seller & Buyer
    await createNotificationInternal({
      user: product.seller,
      type: 'order',
      title: 'New Order Received! 📦',
      message: `A buyer reserved your listing "${product.title}" for ₹${product.price}.`,
      link: '/seller/scan-qr'
    });

    await createNotificationInternal({
      user: buyerId,
      type: 'order',
      title: 'Item Reserved Successfully! 🛍️',
      message: `You reserved "${product.title}". Show your QR code to the seller at pickup.`,
      link: `/product/${product._id}`
    });

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify QR Code & Complete Transaction
// @route   POST /api/orders/verify-qr
// @access  Private (seller or buyer of the order)
export const verifyQR = async (req, res) => {
  try {
    const { qrReference } = req.body;

    if (!qrReference || typeof qrReference !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid QR reference' });
    }

    // 1. Find the order by QR reference and populate product + buyer + seller
    const order = await Order.findOne({ qrReference })
      .populate('product')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    // 2. Verify transaction exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found. Invalid or expired QR code.',
      });
    }

    // 3. Verify product exists
    if (!order.product) {
      return res.status(404).json({
        success: false,
        message: 'Product associated with this transaction no longer exists.',
      });
    }

    // 4. Verify seller matches the authenticated user
    if (order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this transaction. Only the seller can scan.',
      });
    }

    // 5. Verify buyer/order exists and is valid
    if (!order.buyer) {
      return res.status(400).json({
        success: false,
        message: 'Buyer information is missing from this order.',
      });
    }

    // 6. Check product is not already SOLD
    if (order.product.status === 'SOLD') {
      return res.status(400).json({
        success: false,
        message: 'This product has already been sold. Double purchase prevented.',
      });
    }

    // 7. Check transaction is not already completed
    if (order.orderStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This transaction has already been completed.',
      });
    }

    // 8. Verify amount and product details match the server record
    const currentProduct = await Product.findById(order.product._id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists in the database.',
      });
    }
    if (order.amount !== currentProduct.price) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Order: ₹${order.amount}, Product: ₹${currentProduct.price}. Contact support.`,
      });
    }

    // ─── ALL CHECKS PASSED — COMPLETE THE TRANSACTION ───────────

    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const transaction = new Transaction({
      transactionId,
      order: order._id,
      type: 'BUY',
      status: 'VERIFIED',
      qrScanned: true,
      qrScannedAt: Date.now(),
    });

    const savedTxn = await transaction.save();

    // Update Order → COMPLETED and update Timeline
    const completedTime = new Date();
    order.transaction = savedTxn._id;
    order.orderStatus = 'COMPLETED';
    order.paymentStatus = 'SUCCESS';

    if (!order.timeline) order.timeline = {};
    order.timeline.orderCreated = { status: 'completed', timestamp: order.timeline.orderCreated?.timestamp || order.createdAt || completedTime };
    order.timeline.sellerNotified = { status: 'completed', timestamp: order.timeline.sellerNotified?.timestamp || order.createdAt || completedTime };
    order.timeline.sellerResponsePending = { status: 'completed', timestamp: order.timeline.sellerResponsePending?.timestamp || order.createdAt || completedTime };
    order.timeline.sellerAccepted = { status: 'completed', timestamp: order.timeline.sellerAccepted?.timestamp || order.createdAt || completedTime };
    order.timeline.paymentConfirmed = { status: 'completed', timestamp: order.timeline.paymentConfirmed?.timestamp || completedTime };
    order.timeline.pickupReady = { status: 'completed', timestamp: order.timeline.pickupReady?.timestamp || completedTime };
    order.timeline.qrVerified = { status: 'completed', timestamp: completedTime };
    order.timeline.orderCompleted = { status: 'completed', timestamp: completedTime };

    await order.save();

    // Update Product → SOLD (prevents double purchase)
    currentProduct.status = 'SOLD';
    await currentProduct.save();

    // Send Completion Notifications to Seller & Buyer
    await createNotificationInternal({
      user: order.seller._id,
      type: 'order',
      title: 'Transaction Verified & Completed! ✅',
      message: `Payment of ₹${order.amount} for "${currentProduct.title}" verified via QR scan.`,
      link: '/notifications'
    });

    await createNotificationInternal({
      user: order.buyer._id,
      type: 'order',
      title: 'Purchase Completed! 🧾',
      message: `Your purchase of "${currentProduct.title}" has been verified. Digital receipt generated.`,
      link: `/product/${currentProduct._id}`
    });

    // Return full receipt data
    res.json({
      success: true,
      message: 'Transaction verified and completed successfully',
      data: {
        orderId: order.orderId,
        transactionId: savedTxn.transactionId,
        product: {
          _id: currentProduct._id,
          title: currentProduct.title,
          category: currentProduct.category,
          condition: currentProduct.condition,
        },
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        buyer: order.buyer,
        seller: order.seller,
        qrReference: order.qrReference,
        completedAt: savedTxn.qrScannedAt,
      },
    });
  } catch (error) {
    console.error('QR Verification Error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};
// Helper to ensure order timeline structure exists and is up to date
const prepareOrderTimeline = (order) => {
  if (!order) return order;
  const now = order.createdAt || new Date();
  const isCompleted = order.orderStatus === 'COMPLETED';
  const isPaid = order.paymentStatus === 'SUCCESS' || isCompleted;

  if (!order.timeline) {
    order.timeline = {};
  }

  // Ensure default timestamps and statuses
  if (!order.timeline.orderCreated || !order.timeline.orderCreated.timestamp) {
    order.timeline.orderCreated = { status: 'completed', timestamp: now };
  }
  if (!order.timeline.sellerNotified || !order.timeline.sellerNotified.timestamp) {
    order.timeline.sellerNotified = { status: 'completed', timestamp: now };
  }
  if (!order.timeline.sellerResponsePending || !order.timeline.sellerResponsePending.status) {
    const isAccepted = order.timeline.sellerAccepted?.status === 'completed' || isCompleted || isPaid;
    order.timeline.sellerResponsePending = {
      status: 'completed',
      timestamp: now,
    };
  }
  if (!order.timeline.sellerAccepted || !order.timeline.sellerAccepted.status) {
    const isAccepted = isCompleted || isPaid;
    order.timeline.sellerAccepted = {
      status: isAccepted ? 'completed' : 'pending',
      timestamp: isAccepted ? (order.updatedAt || now) : null,
    };
  }
  if (!order.timeline.paymentConfirmed || !order.timeline.paymentConfirmed.status) {
    order.timeline.paymentConfirmed = {
      status: isPaid ? 'completed' : 'pending',
      timestamp: isPaid ? (order.updatedAt || now) : null,
    };
  }
  if (!order.timeline.pickupReady || !order.timeline.pickupReady.status) {
    order.timeline.pickupReady = {
      status: isCompleted ? 'completed' : 'pending',
      timestamp: isCompleted ? (order.updatedAt || now) : null,
    };
  }
  if (!order.timeline.qrVerified || !order.timeline.qrVerified.status) {
    order.timeline.qrVerified = {
      status: isCompleted ? 'completed' : 'pending',
      timestamp: isCompleted ? (order.updatedAt || now) : null,
    };
  }
  if (!order.timeline.orderCompleted || !order.timeline.orderCompleted.status) {
    order.timeline.orderCompleted = {
      status: isCompleted ? 'completed' : 'pending',
      timestamp: isCompleted ? (order.updatedAt || now) : null,
    };
  }

  return order;
};

// @desc    Get logged-in user's orders (as buyer or seller)
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('product', 'title images price category condition')
      .populate('seller', 'name trustScore upiId')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(ord => prepareOrderTimeline(ord));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single order by ID (buyer or seller access)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'title images price category condition')
      .populate('seller', 'name trustScore upiId')
      .populate('buyer', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
    const sellerId = order.seller?._id?.toString() || order.seller?.toString();
    const requesterId = req.user._id.toString();

    // Only buyer or seller of this order may view it
    if (buyerId !== requesterId && sellerId !== requesterId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    const formattedOrder = prepareOrderTimeline(order);

    res.json({ success: true, data: formattedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller accepts an order
// @route   PUT /api/orders/:id/accept
// @access  Private (seller only)
export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the seller can accept this order' });
    }

    const now = new Date();
    if (!order.timeline) order.timeline = {};

    order.timeline.orderCreated = { status: 'completed', timestamp: order.timeline.orderCreated?.timestamp || order.createdAt || now };
    order.timeline.sellerNotified = { status: 'completed', timestamp: order.timeline.sellerNotified?.timestamp || order.createdAt || now };
    order.timeline.sellerResponsePending = { status: 'completed', timestamp: order.timeline.sellerResponsePending?.timestamp || order.createdAt || now };
    order.timeline.sellerAccepted = { status: 'completed', timestamp: now };

    await order.save();

    // Notify Buyer
    await createNotificationInternal({
      user: order.buyer,
      type: 'order',
      title: 'Seller Accepted Order! ✅',
      message: `The seller accepted your order request #${order.orderId.slice(-8)}.`,
      link: `/orders/${order._id}`
    });

    const updatedOrder = await Order.findById(order._id)
      .populate('product', 'title images price category condition')
      .populate('seller', 'name trustScore upiId')
      .populate('buyer', 'name email');

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: prepareOrderTimeline(updatedOrder)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller marks item ready for pickup
// @route   PUT /api/orders/:id/pickup-ready
// @access  Private (seller only)
export const markPickupReady = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the seller can update pickup status' });
    }

    const now = new Date();
    if (!order.timeline) order.timeline = {};

    order.timeline.orderCreated = { status: 'completed', timestamp: order.timeline.orderCreated?.timestamp || order.createdAt || now };
    order.timeline.sellerNotified = { status: 'completed', timestamp: order.timeline.sellerNotified?.timestamp || order.createdAt || now };
    order.timeline.sellerResponsePending = { status: 'completed', timestamp: order.timeline.sellerResponsePending?.timestamp || order.createdAt || now };
    order.timeline.sellerAccepted = { status: 'completed', timestamp: order.timeline.sellerAccepted?.timestamp || now };
    order.timeline.pickupReady = { status: 'completed', timestamp: now };

    await order.save();

    // Notify Buyer
    await createNotificationInternal({
      user: order.buyer,
      type: 'order',
      title: 'Item Ready for Pickup! 📦',
      message: `The seller has marked your order ready for pickup. Show your QR code during handover.`,
      link: `/orders/${order._id}`
    });

    const updatedOrder = await Order.findById(order._id)
      .populate('product', 'title images price category condition')
      .populate('seller', 'name trustScore upiId')
      .populate('buyer', 'name email');

    res.json({
      success: true,
      message: 'Order marked as ready for pickup',
      data: prepareOrderTimeline(updatedOrder)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete UPI Payment (buyer marks as paid to generate bill)
// @route   POST /api/orders/complete-upi
// @access  Private
export const completeUpiPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId).populate('product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify requester is the buyer
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this order' });
    }

    // Verify it's an online payment
    if (order.paymentMethod !== 'Online Payment') {
      return res.status(400).json({ success: false, message: 'Only UPI/Online payments can be completed this way' });
    }

    if (order.orderStatus === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Order is already completed' });
    }

    const now = new Date();

    // Create a transaction record
    const transaction = await Transaction.create({
      order: order._id,
      buyer: order.buyer,
      seller: order.seller,
      amount: order.amount,
      type: 'PAYMENT',
      status: 'COMPLETED',
      referenceId: order.qrReference,
      paymentMethod: order.paymentMethod,
    });

    // Update order status & timeline
    order.orderStatus = 'COMPLETED';
    order.paymentStatus = 'SUCCESS';

    if (!order.timeline) order.timeline = {};
    order.timeline.orderCreated = { status: 'completed', timestamp: order.timeline.orderCreated?.timestamp || order.createdAt || now };
    order.timeline.sellerNotified = { status: 'completed', timestamp: order.timeline.sellerNotified?.timestamp || order.createdAt || now };
    order.timeline.sellerResponsePending = { status: 'completed', timestamp: order.timeline.sellerResponsePending?.timestamp || order.createdAt || now };
    order.timeline.sellerAccepted = { status: 'completed', timestamp: order.timeline.sellerAccepted?.timestamp || now };
    order.timeline.paymentConfirmed = { status: 'completed', timestamp: now };
    order.timeline.pickupReady = { status: 'completed', timestamp: order.timeline.pickupReady?.timestamp || now };
    order.timeline.qrVerified = { status: 'completed', timestamp: order.timeline.qrVerified?.timestamp || now };
    order.timeline.orderCompleted = { status: 'completed', timestamp: now };

    await order.save();

    // Update product status
    if (order.product) {
      order.product.status = 'SOLD';
      await order.product.save();
    }

    // Return the updated order fully populated
    const updatedOrder = await Order.findById(order._id)
      .populate('product')
      .populate('seller', 'name trustScore upiId')
      .populate('buyer', 'name email');

    res.json({
      success: true,
      message: 'Payment marked as complete and receipt generated',
      data: prepareOrderTimeline(updatedOrder),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seller declines order request
// @route   PUT /api/orders/:id/decline
// @access  Private (seller only)
export const declineOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only seller can decline this order' });
    }

    order.orderStatus = 'DECLINED';
    order.declineReason = reason || 'Seller declined request';
    await order.save();

    // Revert product back to ACTIVE
    if (order.product && order.product.status === 'RESERVED') {
      order.product.status = 'ACTIVE';
      await order.product.save();
    }

    await createNotificationInternal({
      user: order.buyer,
      type: 'order',
      title: 'Order Declined ❌',
      message: `Seller declined order #${order.orderId.slice(-8)}. Reason: ${order.declineReason}`,
      link: `/orders/${order._id}`
    });

    res.json({ success: true, message: 'Order request declined', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Buyer or Seller cancels order
// @route   PUT /api/orders/:id/cancel
// @access  Private (buyer or seller)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const userId = req.user._id.toString();
    if (order.buyer.toString() !== userId && order.seller.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Completed orders cannot be cancelled' });
    }

    order.orderStatus = 'CANCELLED';
    await order.save();

    // Revert product back to ACTIVE
    if (order.product && order.product.status === 'RESERVED') {
      order.product.status = 'ACTIVE';
      await order.product.save();
    }

    const otherUser = order.buyer.toString() === userId ? order.seller : order.buyer;
    await createNotificationInternal({
      user: otherUser,
      type: 'order',
      title: 'Order Cancelled 🚫',
      message: `Order #${order.orderId.slice(-8)} was cancelled.`,
      link: `/orders/${order._id}`
    });

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
