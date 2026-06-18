import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
  },
  subcategory: { type: String },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  isOnlineAvailable: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
