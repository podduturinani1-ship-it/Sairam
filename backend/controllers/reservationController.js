import Reservation from '../models/Reservation.js';

import Table from '../models/Table.js';

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Public
const createReservation = async (req, res) => {
  try {
    const { date, time, guests, floor, tableId, tableNumber } = req.body;

    let table;
    if (tableId) {
      table = await Table.findById(tableId);
      if (table.status !== 'Available') {
        return res.status(400).json({ message: `Table is currently marked as ${table.status}` });
      }
      const conflict = await Reservation.findOne({ tableId, date, time, status: { $in: ['Pending', 'Confirmed'] } });
      if (conflict) {
        return res.status(400).json({ message: 'Table is already booked for this date and time' });
      }
    } else {
      const possibleTables = await Table.find({
        status: 'Available',
        floor: floor || 'Ground Floor',
        capacity: { $gte: guests }
      }).sort('capacity');

      for (const t of possibleTables) {
        const conflict = await Reservation.findOne({ tableId: t._id, date, time, status: { $in: ['Pending', 'Confirmed'] } });
        if (!conflict) {
          table = t;
          break;
        }
      }
    }

    if (!table) {
      return res.status(404).json({ message: 'No suitable table available for the selected criteria at this time' });
    }

    const reservation = new Reservation({
      userId: req.user ? req.user._id : null,
      date,
      time,
      numberOfGuests: guests,
      floor: table.floor,
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: 'Confirmed'
    });

    const createdReservation = await reservation.save();

    res.status(201).json(createdReservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
};

// @desc    Get user's reservations
// @route   GET /api/reservations/myreservations
// @access  Private
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id }).sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reservations', error: error.message });
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({}).populate('userId', 'name email phone');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin
const updateReservationStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (reservation) {
      reservation.status = req.body.status || reservation.status;
      const updatedReservation = await reservation.save();

      res.json(updatedReservation);
    } else {
      res.status(404).json({ message: 'Reservation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
};

export { createReservation, getReservations, updateReservationStatus, getMyReservations };
