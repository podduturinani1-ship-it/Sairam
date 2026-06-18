import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Setting from '../models/Setting.js';

// @desc    Fetch all orders
// @route   GET /api/orders
// @access  Private/Admin or Boss or Driver
const getOrders = async (req, res) => {
  try {
    let query = {};
    
    // Strict security: Drivers only see unassigned ready orders OR their own active/completed deliveries
    if (req.user.role === 'driver') {
      query = {
        orderType: 'Delivery',
        $or: [
          { deliveryStatus: { $in: ['Pending', 'Ready For Pickup'] }, assignedDriver: null },
          { assignedDriver: req.user._id }
        ]
      };
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.menuItemId', 'name price')
      .populate('assignedDriver', 'name phone');
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching orders' });
  }
};

// @desc    Fetch logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('items.menuItemId', 'name imageUrl price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching user orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin or Kitchen
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      if (req.body.deliveryStatus) order.deliveryStatus = req.body.deliveryStatus;
      if (req.body.assignedDriver) order.assignedDriver = req.body.assignedDriver;
      if (req.body.status === 'Completed' && !order.completedAt) order.completedAt = new Date();
      if (req.body.deliveryStatus === 'Delivered' && !order.completedAt) order.completedAt = new Date();
      
      const updatedOrder = await order.save();
      
      // Emit socket event for real-time tracking
      const io = req.app.get('io');
      if (io) {
        io.emit('orderStatusUpdated', updatedOrder);
      }
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating order' });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, paymentStatus, transactionId, orderType, deliveryAddress } = req.body;
    
    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Server-side calculation
    let calculatedSubTotal = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      calculatedSubTotal += menuItem.price * item.quantity;
      // enforce server price
      item.price = menuItem.price;
    }
    
    let settings = await Setting.findOne();
    if (!settings) settings = { taxPercentage: 5, deliveryCharges: 50 };
    
    const tax = Math.round(calculatedSubTotal * (settings.taxPercentage / 100));
    const deliveryCharge = orderType === 'Delivery' ? settings.deliveryCharges : 0;
    let finalTotal = calculatedSubTotal + tax + deliveryCharge;
    
    if (paymentMethod === 'COD') {
      finalTotal += Math.round(finalTotal * 0.05); // COD Charge
    }

    const order = new Order({
      userId: req.user ? req.user._id : null,
      items,
      totalAmount: finalTotal,
      paymentMethod,
      paymentStatus,
      transactionId,
      orderType: orderType || 'Takeaway',
      deliveryAddress,
      status: req.body.status || 'Waiting For Approval'
    });

    const createdOrder = await order.save();

    // Emit real-time event to Admin and KDS
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrderReceived', createdOrder);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server Error creating order', error: error.message });
  }
};

export { getOrders, updateOrderStatus, createOrder, getMyOrders };
