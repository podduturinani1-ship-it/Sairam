import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, // Optional, could be a general restaurant review
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  photos: [{ type: String }],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
