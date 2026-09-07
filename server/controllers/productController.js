import mongoose from 'mongoose';
import Product from '../models/Product.js';

// @desc    Fetch all active products with optional filters, intelligent search, and location
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { 
      keyword, 
      category, 
      city,
      minPrice,
      maxPrice,
      condition,
      swap,
      sort
    } = req.query;

    let query = { status: { $in: ['ACTIVE', 'RESERVED', 'SOLD'] } };

    // City filter
    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Condition filter
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Swap filter
    if (swap === 'true') {
      query.isSwapEnabled = true;
    }

    // Price Range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Intelligent Search Query Parsing
    if (keyword && keyword.trim()) {
      let cleanQ = keyword.trim();

      // Check for "in <City>" syntax e.g. "laptop in Vadodara"
      const inMatch = cleanQ.match(/^(.+?)\s+in\s+([a-zA-Z\s]+)$/i);
      if (inMatch) {
        cleanQ = inMatch[1].trim();
        const extractedCity = inMatch[2].trim();
        if (extractedCity) {
          query.city = { $regex: new RegExp(`^${extractedCity}$`, 'i') };
        }
      }

      if (cleanQ) {
        const regex = new RegExp(cleanQ.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
        query.$or = [
          { title: regex },
          { brand: regex },
          { category: regex },
          { description: regex },
          { city: regex }
        ];
      }
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    if (sort === 'price-desc') sortOptions = { price: -1 };

    const products = await Product.find(query)
      .populate('seller', 'name trustScore isVerified profileImage')
      .sort(sortOptions);

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSuggestions = async (req, res) => {
  try {
    const { q, city } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, suggestions: [], products: [] });
    }

    const cleanQ = q.trim();
    const regex = new RegExp(cleanQ.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

    let baseQuery = { status: { $in: ['ACTIVE', 'RESERVED', 'SOLD'] } };
    if (city && city !== 'All') {
      baseQuery.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const matchingProducts = await Product.find({
      ...baseQuery,
      $or: [
        { title: regex },
        { brand: regex },
        { category: regex },
        { description: regex }
      ]
    })
    .select('_id title price images category city brand slug')
    .limit(6);

    // Extract unique keywords for suggestion tags
    const suggestionTags = new Set();
    matchingProducts.forEach(p => {
      if (p.title && p.title.toLowerCase().includes(cleanQ.toLowerCase())) {
        suggestionTags.add(p.title);
      }
      if (p.brand && p.brand.toLowerCase().includes(cleanQ.toLowerCase())) {
        suggestionTags.add(p.brand);
      }
      if (p.category && p.category.toLowerCase().includes(cleanQ.toLowerCase())) {
        suggestionTags.add(p.category);
      }
    });

    res.json({
      success: true,
      suggestions: Array.from(suggestionTags).slice(0, 5),
      products: matchingProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const identifier = req.params.id;
    let product;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier).populate('seller', 'name trustScore isVerified profileImage city');
    }

    if (!product) {
      product = await Product.findOne({ slug: identifier }).populate('seller', 'name trustScore isVerified profileImage city');
    }
    
    if (product) {
      res.json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { createNotificationInternal } from './notificationController.js';

const PROHIBITED_KEYWORDS = ['weapon', 'drug', 'gun', 'explosive', 'stolen', 'fake currency', 'counterfeit', 'replica money', 'illegal', 'contraband'];

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

    const fullText = `${title} ${description} ${category}`.toLowerCase();
    const isProhibited = PROHIBITED_KEYWORDS.some(word => fullText.includes(word));

    const initialStatus = isProhibited ? 'PENDING_REVIEW' : 'ACTIVE';
    const initialModeration = isProhibited ? 'PENDING' : 'APPROVED';

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
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      status: initialStatus,
      moderationStatus: initialModeration,
    });

    const createdProduct = await product.save();

    if (isProhibited) {
      return res.status(201).json({
        success: true,
        message: 'Product submitted. Under admin review due to keyword moderation check.',
        data: createdProduct
      });
    }

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

    const oldPrice = product.price;

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
    product.price = price !== undefined ? Number(price) : product.price;
    product.negotiable = negotiable !== undefined ? negotiable : product.negotiable;
    product.exchangeAvailable = exchangeAvailable !== undefined ? exchangeAvailable : product.exchangeAvailable;
    product.images = images || product.images;
    product.city = city || product.city;

    const updatedProduct = await product.save();

    // Price Drop Alert Notification Trigger
    if (price !== undefined && Number(price) < oldPrice && product.watchers && product.watchers.length > 0) {
      for (const watcherId of product.watchers) {
        await createNotificationInternal({
          user: watcherId,
          type: 'price_drop',
          title: 'Price Drop Alert! 📉',
          message: `"${product.title}" price dropped from ₹${oldPrice} to ₹${product.price}!`,
          link: `/product/${product.slug || product._id}`
        });
      }
    }

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
