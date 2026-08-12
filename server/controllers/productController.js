import Product from '../models/Product.js';

// @desc    Fetch all active products with optional filters and location
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { 
      keyword, 
      category, 
      longitude, 
      latitude, 
      maxDistance = 10000 // default 10km
    } = req.query;

    let query = { status: 'ACTIVE' };

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (category) {
      query.category = category;
    }

    if (longitude && latitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    const products = await Product.find(query).populate('seller', 'name trustScore isVerified profileImage').sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name trustScore isVerified profileImage city');
    
    if (product) {
      res.json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      condition,
      price,
      negotiable,
      exchangeAvailable,
      images,
      city,
      latitude,
      longitude,
    } = req.body;

    const product = new Product({
      title,
      description,
      category,
      brand,
      condition,
      price,
      negotiable,
      exchangeAvailable,
      images: images || [],
      seller: req.user._id,
      city,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      status: 'ACTIVE', // Active for marketplace listing
      moderationStatus: 'APPROVED'
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
