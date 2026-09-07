import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { createNotificationInternal } from '../controllers/notificationController.js';

export const checkAndExpireOrders = async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Find orders that are still CREATED / waiting for seller response past 2 hours
    const expiredOrders = await Order.find({
      orderStatus: 'CREATED',
      createdAt: { $lte: twoHoursAgo }
    }).populate('product');

    for (const order of expiredOrders) {
      const now = new Date();
      order.orderStatus = 'EXPIRED';

      if (!order.timeline) order.timeline = {};
      order.timeline.sellerResponsePending = {
        status: 'completed',
        timestamp: now
      };

      await order.save();

      // Revert product to ACTIVE so other buyers can purchase
      if (order.product && order.product.status === 'RESERVED') {
        order.product.status = 'ACTIVE';
        await order.product.save();
      }

      // Dispatch real notifications to buyer & seller
      await createNotificationInternal({
        user: order.buyer,
        type: 'order',
        title: 'Order Request Expired ⌛',
        message: `The 2-hour seller response window for order #${order.orderId.slice(-8)} has expired. The product is now re-listed.`,
        link: `/orders/${order._id}`
      });

      await createNotificationInternal({
        user: order.seller,
        type: 'order',
        title: 'Order Request Expired ⚠️',
        message: `You missed the 2-hour response window for order #${order.orderId.slice(-8)}. The item has been un-reserved.`,
        link: `/orders/${order._id}`
      });
    }

    // Reminders check for active orders at ~30m, 60m, 90m
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const sixtyMinAgo = new Date(Date.now() - 60 * 60 * 1000);
    const ninetyMinAgo = new Date(Date.now() - 90 * 60 * 1000);

    // Find active pending orders needing reminders
    const pendingOrders = await Order.find({
      orderStatus: 'CREATED',
      createdAt: { $gte: twoHoursAgo }
    });

    for (const ord of pendingOrders) {
      const elapsedMins = Math.floor((Date.now() - new Date(ord.createdAt).getTime()) / (60 * 1000));
      
      if (elapsedMins >= 85 && elapsedMins <= 95 && !ord.reminderSent90) {
        ord.reminderSent90 = true;
        await ord.save();
        await createNotificationInternal({
          user: ord.seller,
          type: 'order',
          title: '30 Minutes Remaining! ⏳',
          message: `Only 30 minutes left to accept order #${ord.orderId.slice(-8)}.`,
          link: `/orders/${ord._id}`
        });
      } else if (elapsedMins >= 55 && elapsedMins <= 65 && !ord.reminderSent60) {
        ord.reminderSent60 = true;
        await ord.save();
        await createNotificationInternal({
          user: ord.seller,
          type: 'order',
          title: '1 Hour Remaining! ⏳',
          message: `You have 1 hour remaining to accept order #${ord.orderId.slice(-8)}.`,
          link: `/orders/${ord._id}`
        });
      }
    }
  } catch (error) {
    console.error('Error in 2-hour expiration task:', error);
  }
};
