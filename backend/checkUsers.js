import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'email role password');
    console.log(users);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();
