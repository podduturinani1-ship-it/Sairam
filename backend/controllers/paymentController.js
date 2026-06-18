import Razorpay from 'razorpay';
import crypto from 'crypto';
import MenuItem from '../models/MenuItem.js';
import Setting from '../models/Setting.js';

// Initialize Razorpay with test keys (or fetch from .env if available)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { items, orderType, paymentMethod } = req.body;

    // Server-side calculation
    let calculatedSubTotal = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      calculatedSubTotal += menuItem.price * item.quantity;
    }
    
    let settings = await Setting.findOne();
    if (!settings) settings = { taxPercentage: 5, deliveryCharges: 50 };
    
    const tax = Math.round(calculatedSubTotal * (settings.taxPercentage / 100));
    const deliveryCharge = orderType === 'Delivery' ? settings.deliveryCharges : 0;
    let finalTotal = calculatedSubTotal + tax + deliveryCharge;
    
    if (paymentMethod === 'COD') {
      finalTotal += Math.round(finalTotal * 0.05); // COD Charge
    }

    const options = {
      amount: Math.round(finalTotal * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', key_secret).update(sign.toString()).digest('hex');

    if (razorpay_signature === expectedSign) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

export { createRazorpayOrder, verifyRazorpayPayment };
