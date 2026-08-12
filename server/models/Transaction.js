import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SWAP'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    qrScanned: {
      type: Boolean,
      default: false,
    },
    qrScannedAt: {
      type: Date,
    },
    paymentDetails: {
      gatewayTransactionId: String,
      receiptUrl: String,
    }
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
