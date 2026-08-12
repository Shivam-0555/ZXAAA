import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Clothing',
        'Electronics',
        'Mobiles',
        'Laptops',
        'Tablets',
        'Cameras',
        'Gaming',
        'Furniture',
        'Books & Study',
        'Bikes & Cycles',
        'Watches',
        'Fashion',
        'Home & Appliances',
        'Sports',
        'Tools',
        'Accessories',
        'Other Approved Items'
      ],
    },
    brand: {
      type: String,
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Used'],
    },
    price: {
      type: Number,
      required: true,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },
    exchangeAvailable: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_REVIEW',
        'ACTIVE',
        'RESERVED',
        'SOLD',
        'SWAPPED',
        'REJECTED',
        'EXPIRED'
      ],
      default: 'PENDING_REVIEW',
    },
    moderationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ location: '2dsphere' });
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
