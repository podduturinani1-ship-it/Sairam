import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user && req.user.isDisabled) {
        return res.status(403).json({ message: 'Your account has been disabled. Please contact support.' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const bossGuard = (req, res, next) => {
  if (req.user && req.user.role === 'boss') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as boss' });
  }
};

const adminGuard = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'boss')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const kitchenGuard = (req, res, next) => {
  if (req.user && (req.user.role === 'kitchen' || req.user.role === 'boss')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as kitchen staff' });
  }
};

const driverGuard = (req, res, next) => {
  if (req.user && (req.user.role === 'driver' || req.user.role === 'boss')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as delivery driver' });
  }
};

const employeeGuard = (req, res, next) => {
  if (req.user && ['boss', 'admin', 'kitchen', 'driver'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an employee' });
  }
};

export { protect, bossGuard, adminGuard, kitchenGuard, driverGuard, employeeGuard };
