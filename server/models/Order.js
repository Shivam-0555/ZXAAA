import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    amount: {
      type: Number,
      required: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    emergencyCharge: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    meetupPoint: {
      type: String,
      default: '',
    },
    meetupTime: {
      type: String,
      default: '',
    },
    declineReason: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Online Payment', 'Pay at Pickup'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: ['CREATED', 'PENDING_PAYMENT', 'PAID', 'COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED', 'REFUNDED'],
      default: 'CREATED',
    },
    qrReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    timeline: {
      orderCreated: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'completed' },
        timestamp: { type: Date, default: Date.now },
      },
      sellerNotified: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'completed' },
        timestamp: { type: Date, default: Date.now },
      },
      sellerResponsePending: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'current' },
        timestamp: { type: Date, default: Date.now },
      },
      sellerAccepted: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'pending' },
        timestamp: { type: Date },
      },
      paymentConfirmed: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'pending' },
        timestamp: { type: Date },
      },
      pickupReady: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'pending' },
        timestamp: { type: Date },
      },
      qrVerified: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'pending' },
        timestamp: { type: Date },
      },
      orderCompleted: {
        status: { type: String, enum: ['completed', 'current', 'pending'], default: 'pending' },
        timestamp: { type: Date },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
