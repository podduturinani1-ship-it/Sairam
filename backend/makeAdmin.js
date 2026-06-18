import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany({}, { role: 'admin' });
    console.log(`Updated ${result.modifiedCount} users to admin status.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

makeAdmin();
