import Table from '../models/Table.js';

import Reservation from '../models/Reservation.js';

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private/Admin
export const getTables = async (req, res) => {
  try {
    const tables = await Table.find({}).populate({
      path: 'currentReservation',
      populate: { path: 'userId', select: 'name email phone' }
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tables', error: error.message });
  }
};

// @desc    Get available tables for a specific date, time, and guests
// @route   GET /api/tables/availability
// @access  Public
export const getAvailableTables = async (req, res) => {
  try {
    const { date, time, guests, floor } = req.query;
    
    if (!date || !time || !guests) {
      return res.status(400).json({ message: 'Please provide date, time, and number of guests' });
    }

    // Find all reservations that overlap with this date and time (assuming 2 hours per reservation, simple match for now)
    const conflictingReservations = await Reservation.find({
      date,
      time,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    const conflictingTableIds = conflictingReservations.map(r => r.tableId.toString());

    // Find all tables that match capacity and are not in conflictingTableIds
    let query = {
      status: 'Available',
      capacity: { $gte: Number(guests) }
    };
    if (floor) {
      query.floor = floor;
    }

    const availableTables = await Table.find(query);
    
    // Filter out conflicting ones
    const finalTables = availableTables.filter(t => !conflictingTableIds.includes(t._id.toString()));

    res.json(finalTables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
export const createTable = async (req, res) => {
  try {
    const { tableNumber, floor, capacity, xPosition, yPosition } = req.body;
    const tableExists = await Table.findOne({ tableNumber });

    if (tableExists) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = await Table.create({ tableNumber, floor, capacity, xPosition, yPosition });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error creating table', error: error.message });
  }
};

// @desc    Update a table's status or position
// @route   PUT /api/tables/:id
// @access  Private/Admin
export const updateTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (table) {
      table.tableNumber = req.body.tableNumber || table.tableNumber;
      table.floor = req.body.floor || table.floor;
      table.capacity = req.body.capacity || table.capacity;
      table.status = req.body.status || table.status;
      if (req.body.xPosition !== undefined) table.xPosition = req.body.xPosition;
      if (req.body.yPosition !== undefined) table.yPosition = req.body.yPosition;
      if (req.body.currentReservation !== undefined) table.currentReservation = req.body.currentReservation;
      
      // If changing to Available, clear reservation
      if (req.body.status === 'Available' || req.body.status === 'Cleaning' || req.body.status === 'Maintenance') {
        table.currentReservation = null;
      }

      const updatedTable = await table.save();
      res.json(updatedTable);
    } else {
      res.status(404).json({ message: 'Table not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating table', error: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (table) {
      await table.deleteOne();
      res.json({ message: 'Table removed' });
    } else {
      res.status(404).json({ message: 'Table not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting table', error: error.message });
  }
};
