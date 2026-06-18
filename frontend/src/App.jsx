import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import OnlineMenu from './pages/OnlineMenu';
import Cart from './pages/Cart';
import OnlineCart from './pages/OnlineCart';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import KitchenDashboard from './pages/KitchenDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = ({ children }) => {
  const location = useLocation();
  const isStaff = ['/admin', '/boss', '/kitchen', '/driver'].some(path => location.pathname.startsWith(path));

  return (
    <div className="app-container">
      {!isStaff && <Navbar />}
      <main style={{ paddingTop: isStaff ? '0' : '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      {!isStaff && <Footer />}
    </div>
  );
};

import BossDashboard from './pages/BossDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/online-menu" element={<OnlineMenu />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/online-cart" element={<OnlineCart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Customer Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              
              {/* Protected Staff Routes (Strict Separation) */}
              <Route path="/kitchen/*" element={<ProtectedRoute allowedRoles={['kitchen', 'boss']}><KitchenDashboard /></ProtectedRoute>} />
              <Route path="/driver/*" element={<ProtectedRoute allowedRoles={['driver', 'boss']}><DeliveryDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin', 'boss']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/boss/*" element={<ProtectedRoute allowedRoles={['boss']}><BossDashboard /></ProtectedRoute>} />

              {/* Catch All 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <ToastContainer position="bottom-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
