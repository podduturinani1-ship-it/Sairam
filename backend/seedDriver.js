import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

const createDriver = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Delete if exists to recreate properly
    await User.deleteOne({ email: 'driver@sairam.com' });
    
    await User.create({
      name: 'Test Driver',
      email: 'driver@sairam.com',
      password: '123456',
      phone: '9999999999',
      role: 'delivery_partner'
    });
    console.log('Driver created successfully!');
    
    console.log('Login credentials -> Email: driver@sairam.com | Password: 123456');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createDriver();
