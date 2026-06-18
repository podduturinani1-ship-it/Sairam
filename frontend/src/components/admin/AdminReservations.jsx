import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, X, Save, Phone, Info, CheckCircle, Hash } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [floor, setFloor] = useState('Ground Floor');
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [filter, setFilter] = useState('Today');
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [resData, tabData] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/reservations`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/tables`, config)
      ]);
      setReservations(resData.data.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)));
      setTables(tabData.data);
      setLoading(false);
      
      // Update selected table if it was modified
      if (selectedTable) {
        const updatedTable = tabData.data.find(t => t._id === selectedTable._id);
        if (updatedTable) setSelectedTable(updatedTable);
      }
    } catch (error) {
      toast.error('Failed to load floor data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const updateReservationStatus = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/reservations/${id}/status`, { status: newStatus }, config);
      toast.success(`Reservation marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateTableStatus = async (status, tableId = selectedTable?._id) => {
    if (!tableId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { status };
      if (status === 'Available') payload.currentReservation = null;
      
      await axios.put(`${import.meta.env.VITE_API_URL}/tables/${tableId}`, payload, config);
      toast.success(`Table marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  const autoAssignTables = async () => {
    const pending = reservations.filter(r => r.status === 'Pending' || r.status === 'Confirmed');
    if (pending.length === 0) return toast.info('No pending reservations to assign');

    const availableTables = tables.filter(t => t.status === 'Available');
    if (availableTables.length === 0) return toast.error('No available tables!');

    let assignedCount = 0;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    for (const res of pending) {
      const suitableTables = availableTables
        .filter(t => t.capacity >= res.numberOfGuests && t.status === 'Available')
        .sort((a, b) => a.capacity - b.capacity);

      if (suitableTables.length > 0) {
        const targetTable = suitableTables[0];
        try {
          await axios.put(`${import.meta.env.VITE_API_URL}/tables/${targetTable._id}`, { 
            status: 'Reserved', 
            currentReservation: res._id 
          }, config);
          targetTable.status = 'Reserved'; 
          assignedCount++;
        } catch (err) {
          console.error(err);
        }
      }
    }
    
    if (assignedCount > 0) {
      toast.success(`Auto-assigned ${assignedCount} reservations!`);
      fetchData();
    } else {
      toast.info('Could not find suitable tables for pending reservations.');
    }
  };

  const handleDragStart = (e, reservation) => {
    e.dataTransfer.setData('reservation', JSON.stringify(reservation));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = async (e, table) => {
    e.preventDefault();
    try {
      const reservationData = e.dataTransfer.getData('reservation');
      if (!reservationData) return;
      const reservation = JSON.parse(reservationData);

      if (table.capacity < reservation.numberOfGuests) {
        return toast.error(`Table ${table.tableNumber} is too small for ${reservation.numberOfGuests} guests!`);
      }
      
      if (table.status !== 'Available' && table.status !== 'Cleaning') {
        return toast.error(`Table ${table.tableNumber} is not available!`);
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/tables/${table._id}`, { 
        status: 'Reserved', 
        currentReservation: reservation._id 
      }, config);
      
      toast.success(`Reservation assigned to Table ${table.tableNumber}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign table');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return '#2E7D32'; 
      case 'Reserved': return '#C62828'; 
      case 'Occupied': return '#EF6C00'; 
      case 'Cleaning': return '#1976D2'; 
      case 'Blocked': return '#424242'; 
      case 'Maintenance': return '#FBC02D'; 
      default: return '#999';
    }
  };

  if (loading) return <div style={{ color: '#FFF', padding: '2rem' }}>Loading restaurant floor plan...</div>;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredReservations = reservations.filter(r => {
    if (filter === 'Today') return r.date === todayStr && !['Completed', 'Cancelled'].includes(r.status);
    if (filter === 'Tomorrow') return r.date === tomorrowStr;
    if (filter === 'Pending') return r.status === 'Pending';
    if (filter === 'Assigned') return (r.status === 'Confirmed' || r.tableNumber != null) && r.status !== 'Completed';
    if (filter === 'Completed') return r.status === 'Completed';
    if (filter === 'Cancelled') return r.status === 'Cancelled';
    return true;
  });

  const filteredTables = tables.filter(t => t.floor === floor);

  const statAvailable = tables.filter(t => t.status === 'Available').length;
  const statReserved = tables.filter(t => t.status === 'Reserved').length;
  const statOccupied = tables.filter(t => t.status === 'Occupied').length;
  const statPending = reservations.filter(r => r.status === 'Pending').length;
  const statWalkIn = 0; 

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0, color: '#FFF' }}>Floor Operations</h2>
        <button onClick={autoAssignTables} className="btn btn-primary shadow-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem' }}>
          <CheckCircle size={20} /> Auto Assign Tables
        </button>
      </div>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Available Tables', value: statAvailable, color: '#2E7D32' },
          { label: 'Reserved Tables', value: statReserved, color: '#C62828' },
          { label: 'Occupied Tables', value: statOccupied, color: '#EF6C00' },
          { label: 'Pending Reservations', value: statPending, color: '#FBC02D' },
          { label: 'Walk-In Guests', value: statWalkIn, color: '#9C27B0' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1E1E1E', border: `1px solid ${stat.color}40`, borderTop: `4px solid ${stat.color}`, borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ color: '#AAA', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{stat.label}</div>
            <div style={{ color: '#FFF', fontSize: '2rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 h-[calc(100vh-250px)]">
        
        <div style={{ width: '25%', minWidth: '320px', backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #333' }}>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', margin: '0 0 1rem 0' }}>Reservations</h3>
            <div className="flex flex-wrap gap-2">
              {['Today', 'Tomorrow', 'Pending', 'Assigned', 'Completed', 'Cancelled'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ 
                    padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', 
                    backgroundColor: filter === f ? 'var(--primary)' : '#2A2A2A',
                    color: filter === f ? '#FFF' : '#AAA',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredReservations.map(res => (
              <div 
                key={res._id} 
                draggable={res.status === 'Pending' || res.status === 'Confirmed'}
                onDragStart={(e) => handleDragStart(e, res)}
                style={{ 
                  backgroundColor: '#2A2A2A', padding: '1.2rem', borderRadius: '10px', border: '1px solid #444', 
                  cursor: (res.status === 'Pending' || res.status === 'Confirmed') ? 'grab' : 'default',
                  borderLeft: `4px solid ${res.status === 'Pending' ? '#FBC02D' : res.status === 'Confirmed' ? '#2E7D32' : '#888'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '1.1rem' }}>{res.name || res.userId?.name || 'Guest'}</div>
                  <div style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {res.numberOfGuests} Guests
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#AAA', fontSize: '0.85rem', marginTop: '8px' }}>
                  <Phone size={12} /> {res.phone || res.userId?.phone || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#AAA', fontSize: '0.85rem', marginTop: '4px' }}>
                  <Calendar size={12} /> {res.date} &nbsp;|&nbsp; <Clock size={12} /> {res.time}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#AAA', fontSize: '0.85rem', marginTop: '4px' }}>
                  <Hash size={12} /> ID: {res._id.slice(-6).toUpperCase()}
                </div>

                {res.specialRequests && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem', color: '#CCC', fontStyle: 'italic' }}>
                    "{res.specialRequests}"
                  </div>
                )}
                
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: res.status === 'Pending' ? '#FBC02D' : '#4CAF50' }}>{res.status}</span>
                  {res.status !== 'Completed' && res.status !== 'Cancelled' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateReservationStatus(res._id, 'Completed')} style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Complete</button>
                      <button onClick={() => updateReservationStatus(res._id, 'Cancelled')} style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredReservations.length === 0 && <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>No reservations found.</div>}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex gap-2">
              <button onClick={() => {setFloor('Ground Floor'); setSelectedTable(null);}} className={`btn ${floor === 'Ground Floor' ? 'btn-primary' : 'btn-outline'}`}>Ground Floor</button>
              <button onClick={() => {setFloor('First Floor'); setSelectedTable(null);}} className={`btn ${floor === 'First Floor' ? 'btn-primary' : 'btn-outline'}`}>First Floor</button>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: '#AAA' }}>
              <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2E7D32' }}></div> Available</div>
              <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#C62828' }}></div> Reserved</div>
              <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF6C00' }}></div> Occupied</div>
              <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1976D2' }}></div> Cleaning</div>
              <div className="flex items-center gap-1"><div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#424242' }}></div> Blocked</div>
            </div>
          </div>

          <div style={{ 
            flex: 1, backgroundColor: '#121212', borderRadius: '12px', 
            border: '2px solid #333', position: 'relative', overflow: 'hidden',
            backgroundImage: 'radial-gradient(#333 1px, transparent 0)', backgroundSize: '30px 30px'
          }}>
            <AnimatePresence mode="wait">
              <motion.div key={floor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%', position: 'absolute' }}>
                
                {floor === 'Ground Floor' && (
                  <>
                    <div style={{ position: 'absolute', left: '0', bottom: '0', width: '20%', height: '15%', backgroundColor: '#222', borderTopRightRadius: '12px', border: '1px dashed #555', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 'bold' }}>ENTRANCE</div>
                    <div style={{ position: 'absolute', right: '0', bottom: '0', width: '20%', height: '15%', backgroundColor: '#222', borderTopLeftRadius: '12px', border: '1px dashed #555', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 'bold' }}>PARKING</div>
                    <div style={{ position: 'absolute', left: '0', top: '0', width: '15%', height: '20%', backgroundColor: '#2A2A2A', borderBottomRightRadius: '12px', border: '2px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAA', fontWeight: 'bold', textAlign: 'center' }}>CASH<br/>COUNTER</div>
                    <div style={{ position: 'absolute', left: '40%', bottom: '0', width: '20%', height: '10%', backgroundColor: 'rgba(212,175,55,0.05)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '0.8rem' }}>WAITING AREA</div>
                  </>
                )}
                {floor === 'First Floor' && (
                  <>
                    <div style={{ position: 'absolute', right: '0', top: '0', width: '25%', height: '100%', backgroundColor: 'rgba(212,175,55,0.02)', borderLeft: '1px dashed var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', color: 'var(--secondary)', letterSpacing: '5px', opacity: 0.5 }}>PRIVATE DINING AREA</div>
                    <div style={{ position: 'absolute', left: '0', bottom: '0', width: '15%', height: '15%', backgroundColor: '#222', borderTopRightRadius: '12px', border: '1px dashed #555', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 'bold' }}>STAIRS</div>
                  </>
                )}

                {filteredTables.map(table => (
                  <motion.div
                    key={table._id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, table)}
                    onClick={() => setSelectedTable(table)}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      position: 'absolute',
                      left: `${table.xPosition}%`,
                      top: `${table.yPosition}%`,
                      width: `${table.capacity > 4 ? (table.capacity >= 8 ? 140 : 110) : 80}px`,
                      height: `${table.capacity >= 8 ? 100 : 80}px`,
                      backgroundColor: getStatusColor(table.status),
                      borderRadius: table.capacity > 4 ? '12px' : '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: selectedTable?._id === table._id ? '0 0 0 4px var(--secondary)' : '0 6px 12px rgba(0,0,0,0.4)',
                      border: table.currentReservation ? '2px dashed #FFF' : '2px solid rgba(255,255,255,0.1)',
                      transition: 'box-shadow 0.2s',
                      zIndex: 10
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{table.tableNumber}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px', marginTop: '4px' }}>{table.capacity} Seats</div>
                    {table.currentReservation && (
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#FFF', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        <Users size={12}/>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div style={{ width: '20%', minWidth: '280px', backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflowY: 'auto' }}>
          {selectedTable ? (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.5rem', margin: 0 }}>Table {selectedTable.tableNumber}</h3>
                <span style={{ backgroundColor: getStatusColor(selectedTable.status), color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedTable.status}</span>
              </div>
              
              <div className="flex flex-col gap-4 mb-6">
                <div style={{ backgroundColor: '#2A2A2A', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ color: '#AAA', fontSize: '0.8rem', marginBottom: '4px' }}>Capacity</div>
                  <div style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18}/> {selectedTable.capacity} Guests</div>
                </div>
                
                {selectedTable.currentReservation && typeof selectedTable.currentReservation === 'object' ? (
                  <div style={{ backgroundColor: 'rgba(212,175,55,0.1)', border: '1px solid var(--secondary)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Assigned Reservation</div>
                    <div style={{ color: '#FFF', fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedTable.currentReservation.name || selectedTable.currentReservation.userId?.name || 'Guest'}</div>
                    <div style={{ color: '#AAA', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> {selectedTable.currentReservation.date} @ {selectedTable.currentReservation.time}</div>
                    <div style={{ color: '#AAA', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14}/> {selectedTable.currentReservation.numberOfGuests} Guests Occupying</div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#2A2A2A', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                    No active reservation
                  </div>
                )}
              </div>

              <h4 style={{ color: '#FFF', marginBottom: '1rem', fontSize: '1rem' }}>Quick Actions</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => updateTableStatus('Available')} className="btn btn-outline" style={{ borderColor: '#2E7D32', color: '#2E7D32' }}>Release / Available</button>
                <button onClick={() => updateTableStatus('Occupied')} className="btn btn-outline" style={{ borderColor: '#EF6C00', color: '#EF6C00' }}>Mark Occupied</button>
                <button onClick={() => updateTableStatus('Cleaning')} className="btn btn-outline" style={{ borderColor: '#1976D2', color: '#1976D2' }}>Mark Cleaning</button>
                <button onClick={() => updateTableStatus('Blocked')} className="btn btn-outline" style={{ borderColor: '#424242', color: '#AAA' }}>Block Table</button>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <p style={{ color: '#666', fontSize: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Info size={14} style={{ flexShrink: 0 }} /> Drag and drop a reservation from the left panel onto a table to assign it.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666', padding: '2rem', textAlign: 'center' }}>
              <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select a table from the floor map to view details and actions.</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default AdminReservations;
