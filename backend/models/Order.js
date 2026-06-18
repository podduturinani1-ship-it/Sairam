import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  orderType: { type: String, enum: ['Takeaway', 'Delivery', 'Dine-In'], required: true },
  deliveryAddress: { type: String }, // optional, depends on orderType
  tableNumber: { type: String }, // optional, for dine-in
  paymentMethod: { type: String, enum: ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Credit Card', 'Debit Card', 'COD', 'Card/UPI', 'Pay at Counter'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'COD'], default: 'Pending' },
  transactionId: { type: String }, // Razorpay Order ID or Payment ID
  status: { 
    type: String, 
    enum: ['Waiting For Approval', 'Waiting', 'Accepted', 'Preparing', 'Quality Check', 'Ready', 'Waiting For Driver', 'Out For Delivery', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Waiting For Approval'
  },
  deliveryStatus: { type: String, enum: ['Pending', 'Ready For Pickup', 'Driver Assigned', 'Picked Up', 'Out For Delivery', 'Delivered'] },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryTime: { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
