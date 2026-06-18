import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tableId: { type: String, required: true },
  tableNumber: { type: String },
  floor: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  numberOfGuests: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], 
    default: 'Confirmed' 
  }
}, {
  timestamps: true,
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
