import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000']; // Add your live domain here later

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

import userRoutes from './routes/userRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows external images from Unsplash to load
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like mobile apps or curl requests)
    // AND allow localhost 5000/5173. 
    // For absolute safety in this unified build, we will allow all for now.
    callback(null, true);
  }
}));
app.use(express.json());

// Rate Limiting for auth/payments
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/users/login', apiLimiter);
app.use('/api/users', apiLimiter);
app.use('/api/payments', apiLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.set('io', io);

if (process.env.NODE_ENV === 'production') {
  // Serve frontend dist folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Any route that doesn't match an API route falls back to index.html
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  // Basic Route for development
  app.get('/', (req, res) => {
    res.send('API is running in Development Mode...');
  });
}

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
