import Review from '../models/Review.js';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/myreviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
};

// @desc    Update review status/featured
// @route   PUT /api/reviews/:id
// @access  Private/Admin
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      review.status = req.body.status || review.status; // 'Approved', 'Hidden', 'Pending'
      review.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : review.isFeatured;
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      await review.deleteOne();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = new Review({
      user: req.user._id,
      rating,
      comment,
      status: 'Pending'
    });
    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

export { getReviews, updateReview, deleteReview, createReview, getMyReviews };
