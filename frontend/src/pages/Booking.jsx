import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const [tables, setTables] = useState([]);
  const [isFetchingTables, setIsFetchingTables] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [floor, setFloor] = useState('Ground Floor');
  const [selectedTable, setSelectedTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const fetchAvailableTables = async () => {
    if (!date || !time || !guests) return;
    
    setIsFetchingTables(true);
    setHasSearched(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/tables/availability?date=${date}&time=${time}&guests=${guests}&floor=${floor}`);
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables", error);
      toast.error("Failed to load table availability");
    } finally {
      setIsFetchingTables(false);
    }
  };

  useEffect(() => {
    if (date && time && guests) {
      fetchAvailableTables();
      setSelectedTable(null);
    }
  }, [date, time, guests, floor]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      toast.error('Please select an available table from the map.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const config = user ? {
        headers: { Authorization: `Bearer ${user.token}` }
      } : {};

      await axios.post(`${import.meta.env.VITE_API_URL}/reservations`, {
        date, time, guests, floor, tableId: selectedTable._id, tableNumber: selectedTable.tableNumber
      }, config);
      
      setIsLoading(false);
      toast.success(`Table ${selectedTable.tableNumber} booked successfully for ${guests} guests on ${date} at ${time}.`, {
        style: { backgroundColor: 'var(--surface-dark)', color: 'var(--secondary)' }
      });
      setSelectedTable(null);
      // Reset form partially
      setDate('');
      setTime('');
      setHasSearched(false);
      setTables([]);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Error booking table. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return '#2E7D32'; // Green
      case 'Reserved': return '#C62828'; // Red
      case 'Occupied': return '#EF6C00'; // Orange
      default: return '#999';
    }
  };

  const filteredTables = tables.filter(t => t.floor === floor);

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: 'var(--surface-dark)', color: 'var(--secondary)', padding: '6rem 0 3rem', textAlign: 'center' }}>
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
            Reserve Your Experience
          </motion.h1>
          <p style={{ color: '#AAA', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Select your preferred dining space and experience our premium hospitality.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Reservation Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '2.5rem', alignSelf: 'start' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '2rem', borderBottom: '1px solid #EEE', paddingBottom: '1rem' }}>Booking Details</h3>
            <form onSubmit={handleBooking} className="flex flex-col gap-5">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</label>
                <input type="date" className="input-elegant" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time</label>
                <input type="time" className="input-elegant" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Guests</label>
                <input type="number" min="1" max="20" className="input-elegant" value={guests} onChange={(e) => setGuests(Number(e.target.value))} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dining Area</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {setFloor('Ground Floor'); setSelectedTable(null);}} className={`btn ${floor === 'Ground Floor' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '10px' }}>Ground Floor</button>
                  <button type="button" onClick={() => {setFloor('First Floor'); setSelectedTable(null);}} className={`btn ${floor === 'First Floor' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '10px' }}>First Floor</button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '16px' }} disabled={!selectedTable || isLoading}>
                {isLoading ? 'Processing...' : (selectedTable ? `Confirm Table ${selectedTable.tableNumber}` : 'Select a Table')}
              </button>
            </form>
          </motion.div>
          
          {/* Interactive Floor Map */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderBottom: '1px solid #EEE', paddingBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: 0 }}>Interactive Floor Map</h3>
              <div className="flex gap-4 text-sm" style={{ fontSize: '0.85rem' }}>
                <div className="flex items-center gap-2"><div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2E7D32' }}></div> Available</div>
                <div className="flex items-center gap-2"><div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C62828' }}></div> Reserved</div>
                <div className="flex items-center gap-2"><div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF6C00' }}></div> Occupied</div>
              </div>
            </div>

            {isFetchingTables ? (
              <div style={{ flex: 1, minHeight: '500px', backgroundColor: '#FAFAFA', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#E0E0E0' }} />
              </div>
            ) : date && time ? (
              <div style={{ 
                flex: 1, minHeight: '500px', backgroundColor: '#FAFAFA', borderRadius: 'var(--radius-lg)', 
                border: '2px solid #EEE', position: 'relative', overflow: 'hidden',
                backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)', backgroundSize: '20px 20px'
              }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', color: '#666' }}>Entrance</div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', color: '#666' }}>Kitchen</div>
                
                <AnimatePresence mode="wait">
                  <motion.div key={floor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%', position: 'absolute' }}>
                    {tables.length === 0 && hasSearched && !isFetchingTables ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C62828', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        No tables available for selected slot.
                      </div>
                    ) : (
                      tables.map(table => (
                        <motion.div
                          key={table._id}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setSelectedTable(table)}
                          style={{
                            position: 'absolute',
                            left: `${table.xPosition || table.x}%`,
                            top: `${table.yPosition || table.y}%`,
                            width: `${table.capacity > 2 ? (table.capacity > 4 ? 100 : 80) : 60}px`,
                            height: '60px',
                            backgroundColor: selectedTable?._id === table._id ? 'var(--secondary)' : getStatusColor(table.status),
                            borderRadius: table.capacity > 2 ? 'var(--radius-md)' : '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: selectedTable?._id === table._id ? '0 0 0 4px rgba(212, 175, 55, 0.4)' : 'var(--shadow-subtle)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          T-{table.tableNumber}
                          <span style={{ position: 'absolute', bottom: '-20px', color: '#666', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {table.capacity} Seats
                          </span>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888', backgroundColor: '#FAFAFA', borderRadius: 'var(--radius-lg)', border: '2px dashed #CCC' }}>
                <Calendar size={48} style={{ marginBottom: '1rem', color: '#CCC' }} />
                <p style={{ fontSize: '1.2rem' }}>Please select Date and Time to view table availability.</p>
              </div>
            )}
          </motion.div>
          
        </div>
      </div>
    </div>
  );
};

export default Booking;

