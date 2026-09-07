import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['product', 'user', 'order'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'Fraud',
        'Fake Product',
        'Wrong Information',
        'Prohibited Product',
        'Spam',
        'Abusive Behaviour',
        'Other'
      ],
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
