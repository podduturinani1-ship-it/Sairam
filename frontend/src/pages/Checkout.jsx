import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PaymentSimulatorModal from '../components/PaymentSimulatorModal';

// Haversine formula to calculate distance between two coordinates in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

const RESTAURANT_LAT = 19.08403495223323; // Sai Ram Restaurant Latitude
const RESTAURANT_LNG = 78.35497019015621; // Sai Ram Restaurant Longitude
const MAX_DELIVERY_RADIUS_KM = 5;

const ONLINE_METHODS = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Credit Card', 'Debit Card'];

const Checkout = () => {
  const { onlineCartItems: cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [address, setAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [distance, setDistance] = useState(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);

  const [settings, setSettings] = useState({ taxPercentage: 5, deliveryCharges: 50 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
        if (data) setSettings(data);
      } catch (err) {
        console.error("Could not fetch settings", err);
      }
    };
    fetchSettings();

    if (!user) {
      toast.info('Please login to checkout');
      navigate('/login?redirect=/checkout');
    }
    if (cartItems.length === 0) {
      navigate('/online-menu');
    } else {
      verifyLocationWithGPS();
    }
  }, [user, navigate, cartItems]);

  const verifyLocationWithGPS = () => {
    setIsVerifyingLocation(true);
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const dist = getDistanceFromLatLonInKm(RESTAURANT_LAT, RESTAURANT_LNG, userLat, userLng);
        setDistance(dist);
        setIsVerifyingLocation(false);
        if (dist > MAX_DELIVERY_RADIUS_KM) {
          setLocationError(`You are ${dist.toFixed(1)}km away. We only deliver within ${MAX_DELIVERY_RADIUS_KM}km.`);
        } else {
          toast.success(`Location verified! You are ${dist.toFixed(1)}km away.`);
        }
      }, (error) => {
        setIsVerifyingLocation(false);
        setLocationError('GPS access denied or failed. Please type your address below to verify distance.');
      });
    } else {
      setIsVerifyingLocation(false);
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const verifyAddressManually = async () => {
    if (!address.trim()) return toast.error('Please enter an address to verify');
    setIsVerifyingLocation(true);
    try {
      // Use Nominatim OpenStreetMap API for free geocoding
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      if (res.data && res.data.length > 0) {
        const userLat = parseFloat(res.data[0].lat);
        const userLng = parseFloat(res.data[0].lon);
        const dist = getDistanceFromLatLonInKm(RESTAURANT_LAT, RESTAURANT_LNG, userLat, userLng);
        setDistance(dist);
        if (dist > MAX_DELIVERY_RADIUS_KM) {
          setLocationError(`Address is ${dist.toFixed(1)}km away. We only deliver within ${MAX_DELIVERY_RADIUS_KM}km.`);
        } else {
          setLocationError('');
          toast.success(`Address verified! Distance: ${dist.toFixed(1)}km.`);
        }
      } else {
        setLocationError('Could not find this address. Please be more specific (e.g., include city and zip code).');
      }
    } catch (err) {
      setLocationError('Failed to verify address.');
    }
    setIsVerifyingLocation(false);
  };

  const foodTotal = getCartTotal(true);
  const tax = Math.round(foodTotal * (settings.taxPercentage / 100));
  const deliveryCharge = settings.deliveryCharges;
  const subTotal = foodTotal + tax + deliveryCharge;
  const codCharge = paymentMethod === 'COD' ? Math.round(subTotal * 0.05) : 0;
  const finalTotal = subTotal + codCharge;

  const handleInitiateOrder = () => {
    if (!address.trim()) return toast.error('Please enter a delivery address');
    if (locationError || distance > MAX_DELIVERY_RADIUS_KM) return toast.error('Address is outside delivery zone or unverified.');

    if (paymentMethod === 'COD') {
      setProcessing(true);
      createBackendOrder('COD', 'COD', null);
    } else {
      // Open Payment Simulator Modal
      setShowSimulator(true);
    }
  };

  const handleSimulatedSuccess = async (transactionId) => {
    setShowSimulator(false);
    setProcessing(true);
    await createBackendOrder(paymentMethod, 'Paid', transactionId);
  };

  const handleSimulatedFailure = () => {
    setShowSimulator(false);
    toast.error('Payment Failed: Transaction declined by simulator.');
  };

  const createBackendOrder = async (method, status, transactionId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const orderPayload = {
        items: cartItems.map(i => ({ menuItemId: i._id, quantity: i.qty, price: i.price })),
        totalAmount: finalTotal,
        paymentMethod: method,
        paymentStatus: status,
        transactionId: transactionId || ('COD_' + Date.now()),
        orderType: 'Delivery',
        deliveryAddress: address
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderPayload, config);
      toast.success('Order Successfully Placed!');
      clearCart(true); // Clear online cart
      navigate('/my-orders');
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error creating order');
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', color: '#FFF' }}>
      <AnimatePresence>
        {showSimulator && (
          <PaymentSimulatorModal 
            amount={finalTotal} 
            method={paymentMethod} 
            onSuccess={handleSimulatedSuccess} 
            onFailure={handleSimulatedFailure} 
            onCancel={() => setShowSimulator(false)} 
          />
        )}
      </AnimatePresence>

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>Delivery Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
          
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck color="var(--secondary)" /> Location & Address
          </h2>

          {isVerifyingLocation && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--secondary)', borderRadius: '8px', marginBottom: '1rem' }}>
              Checking Location / Verifying Distance...
            </div>
          )}

          {locationError && !isVerifyingLocation && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 83, 80, 0.1)', color: '#EF5350', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '8px' }}>
              <AlertCircle /> {locationError}
            </div>
          )}

          {distance !== null && distance <= MAX_DELIVERY_RADIUS_KM && !isVerifyingLocation && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(102, 187, 106, 0.1)', color: '#66BB6A', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '8px' }}>
              <CheckCircle /> Address verified ({distance.toFixed(1)} km away).
            </div>
          )}

          <div className="mb-4">
            <label style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: '4px', display: 'block' }}>
              {distance !== null && distance <= MAX_DELIVERY_RADIUS_KM && !locationError 
                ? "Delivery Address (Required for Driver)" 
                : "Delivery Address"}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <textarea 
                className="input-elegant" 
                rows="3" 
                placeholder={distance !== null && distance <= MAX_DELIVERY_RADIUS_KM && !locationError 
                  ? "GPS verified! Please type your Door No, Building, and Street name for the delivery driver..." 
                  : "Enter complete address manually if GPS failed..."}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ flex: 1 }}
              />
              {(!distance || distance > MAX_DELIVERY_RADIUS_KM || locationError) && (
                <button className="btn btn-outline" onClick={verifyAddressManually} disabled={isVerifyingLocation} style={{ height: 'fit-content' }}>
                  Verify
                </button>
              )}
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '2rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard color="var(--secondary)" /> Payment Method
          </h2>
          
          <div className="flex flex-col gap-3">
            {ONLINE_METHODS.map(method => (
              <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', border: `1px solid ${paymentMethod === method ? 'var(--secondary)' : '#333'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: paymentMethod === method ? 'rgba(212, 175, 55, 0.1)' : 'transparent', transition: 'all 0.2s' }}>
                <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>{method}</div>
                  <Smartphone size={18} color="#AAA" />
                </div>
              </label>
            ))}

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', border: `1px solid ${paymentMethod === 'COD' ? 'var(--secondary)' : '#333'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: paymentMethod === 'COD' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', marginTop: '1rem' }}>
              <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Cash On Delivery</div>
                <div style={{ color: '#EF5350', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> Includes an additional 5% handling charge
                </div>
              </div>
            </label>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333', height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
            {cartItems.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#AAA' }}>
                <span>{item.qty}x {item.name}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#AAA' }}>
            <span>Subtotal</span>
            <span>₹{foodTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#AAA' }}>
            <span>Taxes ({settings.taxPercentage}%)</span>
            <span>₹{tax}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#AAA' }}>
            <span>Delivery Charge</span>
            <span>₹{deliveryCharge}</span>
          </div>
          {paymentMethod === 'COD' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#EF5350' }}>
              <span>COD Handling Charge (5%)</span>
              <span>₹{codCharge}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #333', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
            <span>Total</span>
            <span>₹{finalTotal}</span>
          </div>

          <button 
            onClick={handleInitiateOrder}
            disabled={processing || isVerifyingLocation || locationError || (distance !== null && distance > MAX_DELIVERY_RADIUS_KM)}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: (processing || isVerifyingLocation || locationError || (distance !== null && distance > MAX_DELIVERY_RADIUS_KM)) ? 0.5 : 1 }}
          >
            {processing ? 'Processing...' : (
              <>
                <CheckCircle size={18} /> {paymentMethod === 'COD' ? 'Confirm COD Order' : `Pay ₹${finalTotal}`}
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;

