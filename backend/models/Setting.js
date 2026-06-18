import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true, default: 'Sai Ram Food Court' },
  phoneNumber: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'contact@sairamfoodcourt.com' },
  address: { type: String, default: '123 Main Street, City, State, ZIP' },
  openingHours: { type: String, default: 'Mon-Sun: 10:00 AM - 11:00 PM' },
  deliveryCharges: { type: Number, default: 50 },
  taxPercentage: { type: Number, default: 5 },
  facebookLink: { type: String, default: '' },
  instagramLink: { type: String, default: '' }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
