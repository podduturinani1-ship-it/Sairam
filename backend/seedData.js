import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import MenuItem from './models/MenuItem.js';
import Table from './models/Table.js';

dotenv.config();

const MOCK_MENU = [
  { name: 'Paneer Butter Masala', description: 'Rich and creamy curry made with fresh cottage cheese, aromatic spices, and butter.', price: 250, category: 'Veg', subcategory: 'Curry', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600&q=80', isAvailable: true },
  { name: 'Hyderabadi Chicken Biryani', description: 'Classic authentic biryani cooked with aromatic spices and premium long-grain basmati rice.', price: 300, category: 'Biryanis', subcategory: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80', isAvailable: true },
  { name: 'Mutton Rogan Josh', description: 'Tender mutton pieces braised with a gravy flavored with garlic, ginger and aromatic spices.', price: 420, category: 'Non Veg', subcategory: 'Curry', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80', isAvailable: true },
  { name: 'Ghee Roast Dosa', description: 'Crispy fermented crepe roasted with pure desi ghee, served with chutneys.', price: 120, category: 'Tiffins', subcategory: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80', isAvailable: true },
  { name: 'Fresh Mango Delight', description: 'Freshly squeezed seasonal mangoes with a touch of mint.', price: 100, category: 'Drinks', subcategory: 'Cold', imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80', isAvailable: true },
  { name: 'Classic Vanilla Sundae', description: 'Premium vanilla ice cream topped with chocolate fudge and roasted nuts.', price: 150, category: 'Ice Creams', subcategory: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600&q=80', isAvailable: true },
  { name: 'Kingfisher Premium', description: 'Refreshing premium mild beer. (Age 21+ only)', price: 220, category: 'Drinks', subcategory: 'Hard', imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80', isAvailable: true },
  { name: 'Special Chicken 65', description: 'Spicy, deep-fried chicken dish originating from Chennai, perfect as an appetizer.', price: 280, category: 'Non Veg', subcategory: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=80', isAvailable: false },
];

const MOCK_TABLES = [
  { tableNumber: '1', floor: 'Ground Floor', capacity: 2, status: 'Available', x: 10, y: 10 },
  { tableNumber: '2', floor: 'Ground Floor', capacity: 2, status: 'Reserved', x: 30, y: 10 },
  { tableNumber: '3', floor: 'Ground Floor', capacity: 4, status: 'Available', x: 60, y: 10 },
  { tableNumber: '4', floor: 'Ground Floor', capacity: 4, status: 'Occupied', x: 80, y: 10 },
  { tableNumber: '5', floor: 'Ground Floor', capacity: 6, status: 'Available', x: 45, y: 50 },
  { tableNumber: '6', floor: 'Ground Floor', capacity: 6, status: 'Available', x: 45, y: 80 },
  { tableNumber: '7', floor: 'First Floor', capacity: 4, status: 'Available', x: 20, y: 20 },
  { tableNumber: '8', floor: 'First Floor', capacity: 8, status: 'Reserved', x: 60, y: 20 },
  { tableNumber: '9', floor: 'First Floor', capacity: 4, status: 'Available', x: 20, y: 70 },
  { tableNumber: '10', floor: 'First Floor', capacity: 4, status: 'Occupied', x: 60, y: 70 },
];

const seedData = async () => {
  try {
    await connectDB();

    await MenuItem.deleteMany();
    await Table.deleteMany();

    await MenuItem.insertMany(MOCK_MENU);
    await Table.insertMany(MOCK_TABLES);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
