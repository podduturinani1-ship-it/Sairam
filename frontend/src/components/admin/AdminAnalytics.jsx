import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Calendar, Users, TrendingUp, Clock, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#D4AF37', '#6B1A24', '#FF8C00', '#4CAF50', '#9C27B0', '#2196F3', '#FF9800', '#E91E63'];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7Days'); // '7Days' or '30Days'
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics`, config);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) return <div style={{ color: '#FFF', padding: '2rem' }}>Loading business intelligence data...</div>;
  if (!data) return <div style={{ color: '#EF5350', padding: '2rem' }}>Failed to load analytics data.</div>;

  // Check if business has actual data (Total Revenue > 0 or Orders > 0)
  if (data.orders.total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#AAA' }}>
        <AlertCircle size={64} style={{ marginBottom: '1rem', color: '#555' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#FFF' }}>No business data available yet.</h2>
        <p>Analytics will automatically generate once customers start placing orders and making reservations.</p>
      </div>
    );
  }

  const activeRevenueData = timeRange === '7Days' ? data.charts.revenue7Days : data.charts.revenue30Days;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', color: '#FFF' }}>Business Intelligence</h2>
      
      {/* Top Level KPIs */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Today's Revenue", value: `₹${data.revenue.today}`, icon: <DollarSign size={20} color="var(--secondary)" /> },
          { label: "This Week Revenue", value: `₹${data.revenue.thisWeek}`, icon: <TrendingUp size={20} color="#4CAF50" /> },
          { label: "Total Revenue", value: `₹${data.revenue.total}`, icon: <Activity size={20} color="#2196F3" /> },
          { label: "Orders Today", value: data.orders.today, icon: <ShoppingBag size={20} color="#FF9800" /> },
          { label: "New Customers (Mo)", value: data.customers.thisMonth, icon: <Users size={20} color="#9C27B0" /> },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: '#1E1E1E', padding: '1.2rem', border: '1px solid #333', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
              {stat.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart (Takes up 2 cols) */}
        <div style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#FFF', margin: 0 }}>Revenue Over Time</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setTimeRange('7Days')} className="btn" style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: timeRange === '7Days' ? 'var(--secondary)' : 'transparent', color: timeRange === '7Days' ? '#000' : '#AAA', border: '1px solid #333' }}>7 Days</button>
              <button onClick={() => setTimeRange('30Days')} className="btn" style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: timeRange === '30Days' ? 'var(--secondary)' : 'transparent', color: timeRange === '30Days' ? '#000' : '#AAA', border: '1px solid #333' }}>30 Days</button>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#AAA" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#AAA" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: 'var(--secondary)' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--secondary)" strokeWidth={3} dot={timeRange === '7Days' ? { r: 4, fill: '#121212', strokeWidth: 2 } : false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#FFF', marginBottom: '1.5rem', textAlign: 'center' }}>Sales by Category</h3>
          <div style={{ height: '300px' }}>
            {data.charts.categoryPopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.categoryPopularity}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.categoryPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', color: '#AAA' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>No category data</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Peak Hours Chart */}
        <div style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Clock color="var(--secondary)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#FFF', margin: 0 }}>Peak Order Hours</h3>
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="hour" stroke="#AAA" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="#AAA" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#2A2A2A' }} contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }} />
                <Bar dataKey="orders" name="Total Orders" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items Table */}
        <div style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', overflowY: 'auto', maxHeight: '330px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#FFF', marginBottom: '1rem' }}>Top Selling Dishes</h3>
          {data.charts.topItems.length > 0 ? (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#AAA', fontSize: '0.8rem', borderBottom: '1px solid #333' }}>
                  <th style={{ paddingBottom: '8px' }}>Dish Name</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'center' }}>Qty Sold</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.charts.topItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #2A2A2A' }}>
                    <td style={{ padding: '12px 0', color: '#FFF', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '12px 0', textAlign: 'center', color: '#AAA' }}>{item.quantitySold}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: '#4CAF50', fontWeight: 'bold' }}>₹{item.revenueGenerated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>No item data available</div>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default AdminAnalytics;

