import Product from '../models/Product.js';

// @desc    Fetch all active products with optional filters and location
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { 
      keyword, 
      category, 
      city
    } = req.query;

    let query = { status: { $in: ['ACTIVE', 'RESERVED', 'SOLD'] } };

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (category) {
      query.category = category;
    }

    if (city) {
      // Perform case-insensitive match for city
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure the authenticated user is the seller/owner
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
    }

    // Prevent editing if the product is already sold
    if (product.status === 'SOLD') {
      return res.status(400).json({ success: false, message: 'Cannot edit a sold product' });
    }

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
    } = req.body;

    // Update fields
    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.condition = condition || product.condition;
    product.price = price !== undefined ? price : product.price;
    product.negotiable = negotiable !== undefined ? negotiable : product.negotiable;
    product.exchangeAvailable = exchangeAvailable !== undefined ? exchangeAvailable : product.exchangeAvailable;
    product.images = images || product.images;
    product.city = city || product.city;

    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure the authenticated user is the seller/owner
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    // Delete the product
    await product.deleteOne();

    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
