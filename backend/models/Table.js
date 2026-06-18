import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true },
  floor: { type: String, enum: ['Ground Floor', 'First Floor'], default: 'Ground Floor' },
  capacity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Blocked', 'Maintenance'], 
    default: 'Available' 
  },
  currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },
  xPosition: { type: Number, default: 0 }, // For visual floor plan
  yPosition: { type: Number, default: 0 }  // For visual floor plan
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);
export default Table;
