import Review from '../models/Review.js';
import User from '../models/User.js';

// @desc    Create a new review for a user after a transaction
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { revieweeId, transactionId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Optional: Add check to ensure transaction exists and belongs to these users

    const review = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      transaction: transactionId,
      rating,
      comment,
    });

    await review.save();

    // Update user's trust score
    const reviews = await Review.find({ reviewee: revieweeId });
    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Scale 1-5 rating to 0-100 trust score
    const newTrustScore = Math.round((averageRating / 5) * 100);
    
    await User.findByIdAndUpdate(revieweeId, { trustScore: newTrustScore });

    res.status(201).json({ success: true, data: review, newTrustScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
