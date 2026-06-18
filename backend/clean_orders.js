import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Order = (await import('./models/Order.js')).default;
    
    // Delete all orders to give a fresh start for the pipeline test
    await Order.deleteMany({});
    console.log('All old mock orders cleared. Ready for fresh pipeline test.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanOrders();
