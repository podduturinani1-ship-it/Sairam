import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'], default: 'Available' },
  floor: { type: String, required: true },
  currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  xPosition: { type: Number, default: 0 },
  yPosition: { type: Number, default: 0 }
}, { timestamps: true });

const Table = mongoose.models.Table || mongoose.model('Table', tableSchema);

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Wipe existing tables
    await Table.deleteMany({});
    console.log('Deleted old tables');

    const newTables = [
      // Ground Floor
      { tableNumber: '1', capacity: 2, floor: 'Ground Floor', xPosition: 20, yPosition: 20 },
      { tableNumber: '2', capacity: 2, floor: 'Ground Floor', xPosition: 20, yPosition: 45 },
      { tableNumber: '3', capacity: 4, floor: 'Ground Floor', xPosition: 40, yPosition: 20 },
      { tableNumber: '4', capacity: 4, floor: 'Ground Floor', xPosition: 40, yPosition: 45 },
      { tableNumber: '5', capacity: 6, floor: 'Ground Floor', xPosition: 60, yPosition: 20 },
      { tableNumber: '6', capacity: 6, floor: 'Ground Floor', xPosition: 60, yPosition: 45 },
      { tableNumber: '7', capacity: 8, floor: 'Ground Floor', xPosition: 80, yPosition: 30 },
      
      // First Floor
      { tableNumber: 'F1', capacity: 4, floor: 'First Floor', xPosition: 20, yPosition: 20 },
      { tableNumber: 'F2', capacity: 6, floor: 'First Floor', xPosition: 20, yPosition: 50 },
      { tableNumber: 'P1', capacity: 10, floor: 'First Floor', xPosition: 60, yPosition: 20 }, // Private Dining
      { tableNumber: 'L1', capacity: 15, floor: 'First Floor', xPosition: 60, yPosition: 60 }, // Large Group / Party
    ];

    await Table.insertMany(newTables);
    console.log('Inserted new realistic tables!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedTables();
