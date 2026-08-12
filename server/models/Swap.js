import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema(
  {
    proposer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposerProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    receiverProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    priceDifference: {
      type: Number,
      default: 0,
    },
    priceDifferencePaidBy: {
      type: String,
      enum: ['PROPOSER', 'RECEIVER', 'NONE'],
      default: 'NONE',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Swap = mongoose.model('Swap', swapSchema);
export default Swap;
