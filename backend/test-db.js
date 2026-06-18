import mongoose from 'mongoose';
import Order from './models/Order.js';

const run = async () => {
  await mongoose.connect('mongodb+srv://durgasaipavan2002:v0sZlZ1oT9Xb2uP3@cluster0.pdtly.mongodb.net/sairam?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    const order = new Order({
      userId: '662b1b3b1b3b1b3b1b3b1b3b', // Dummy valid object id
      items: [{ menuItemId: '662b1b3b1b3b1b3b1b3b1b3b', quantity: 1, price: 100 }],
      totalAmount: 100,
      paymentMethod: 'Pay at Counter',
      paymentStatus: 'Pending',
      transactionId: 'DINE_IN_123',
      orderType: 'Dine-In',
      deliveryAddress: 'In-Store',
      status: 'Accepted'
    });
    await order.save();
    console.log("Success!");
  } catch (err) {
    console.log("Validation Error:", err.message);
  }
  process.exit();
}
run();
