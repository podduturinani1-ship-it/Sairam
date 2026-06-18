import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Filter for revenue (Only Paid or COD)
    const revenueFilter = { paymentStatus: { $in: ['Paid', 'COD'] } };

    // Execute all heavy aggregations concurrently for speed
    const [
      // 1. Revenue Metrics
      revenueStats,
      
      // 2. Orders Metrics
      totalOrdersCount,
      todayOrdersCount,

      // 3. Customer Metrics
      totalCustomersCount,
      todayCustomersCount,
      monthCustomersCount,

      // 4. Revenue Graph (Last 30 Days)
      revenueGraphAgg,

      // 5. Category Popularity
      categoryAgg,

      // 6. Top Selling Items
      topItemsAgg,

      // 7. Peak Hours Analysis
      peakHoursAgg,

      // 8. Reservation Metrics
      todayReservationsCount,
      weekReservationsCount,
      topTablesAgg,

      // 9. Staff / Operations Analytics
      activeDriversCount,
      pendingDeliveriesCount,
      kitchenPreparedTodayCount
    ] = await Promise.all([
      // 1. Revenue Metrics
      Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            todaysRevenue: {
              $sum: { $cond: [{ $gte: ['$createdAt', today] }, '$totalAmount', 0] }
            },
            thisWeekRevenue: {
              $sum: { $cond: [{ $gte: ['$createdAt', startOfWeek] }, '$totalAmount', 0] }
            },
            thisMonthRevenue: {
              $sum: { $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$totalAmount', 0] }
            }
          }
        }
      ]),

      // 2. Orders Metrics
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),

      // 3. Customer Metrics
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: today } }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),

      // 4. Revenue Graph (Last 30 Days)
      Order.aggregate([
        { $match: { ...revenueFilter, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 5. Category Popularity
      Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'menuitems',
            localField: 'items.menuItemId',
            foreignField: '_id',
            as: 'menuDetails'
          }
        },
        { $unwind: '$menuDetails' },
        {
          $group: {
            _id: '$menuDetails.category',
            value: { $sum: '$items.quantity' }
          }
        },
        { $project: { name: '$_id', value: 1, _id: 0 } },
        { $sort: { value: -1 } }
      ]),

      // 6. Top Selling Items
      Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'menuitems',
            localField: 'items.menuItemId',
            foreignField: '_id',
            as: 'menuDetails'
          }
        },
        { $unwind: '$menuDetails' },
        {
          $group: {
            _id: '$menuDetails.name',
            quantitySold: { $sum: '$items.quantity' },
            revenueGenerated: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $project: { name: '$_id', quantitySold: 1, revenueGenerated: 1, _id: 0 } },
        { $sort: { quantitySold: -1 } },
        { $limit: 10 }
      ]),

      // 7. Peak Hours Analysis
      Order.aggregate([
        {
          $group: {
            _id: { $hour: { date: '$createdAt', timezone: 'Asia/Kolkata' } },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 8. Reservation Metrics
      Reservation.countDocuments({ date: today.toISOString().split('T')[0] }),
      Reservation.countDocuments({ date: { $gte: today.toISOString().split('T')[0] } }), // Simplistic for week/upcoming
      Reservation.aggregate([
        {
          $group: {
            _id: '$tableNumber',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // 9. Staff Operations
      User.countDocuments({ role: 'driver', isDisabled: false }),
      Order.countDocuments({ deliveryStatus: { $in: ['Pending', 'Ready For Pickup', 'Driver Assigned', 'Out For Delivery'] } }),
      Order.countDocuments({ status: { $in: ['Ready', 'Delivered', 'Completed'] }, updatedAt: { $gte: today } })
    ]);

    // Parse Revenue Graph for 7 Days & 30 Days
    const revenue7Days = [];
    const revenue30Days = [];
    
    // Generate empty 30 days
    for (let i = 0; i <= 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dString = d.toISOString().split('T')[0];
      const found = revenueGraphAgg.find(x => x._id === dString);
      const val = found ? found.revenue : 0;
      
      const point = {
        date: dString,
        time: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: val
      };
      
      revenue30Days.push(point);
      if (i >= 24) revenue7Days.push(point); // Last 7 days
    }

    // Format Peak Hours
    const formattedPeakHours = [];
    for (let i = 0; i < 24; i++) {
      const found = peakHoursAgg.find(x => x._id === i);
      const ampm = i >= 12 ? 'PM' : 'AM';
      const hour12 = i % 12 || 12;
      formattedPeakHours.push({
        hour: `${hour12} ${ampm}`,
        orders: found ? found.orderCount : 0
      });
    }

    res.json({
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        today: revenueStats[0]?.todaysRevenue || 0,
        thisWeek: revenueStats[0]?.thisWeekRevenue || 0,
        thisMonth: revenueStats[0]?.thisMonthRevenue || 0,
        avgOrderValue: Math.round(revenueStats[0]?.avgOrderValue || 0)
      },
      orders: {
        total: totalOrdersCount,
        today: todayOrdersCount
      },
      customers: {
        total: totalCustomersCount,
        today: todayCustomersCount,
        thisMonth: monthCustomersCount
      },
      reservations: {
        today: todayReservationsCount,
        upcomingWeek: weekReservationsCount,
        topTables: topTablesAgg
      },
      staff: {
        activeDrivers: activeDriversCount,
        pendingDeliveries: pendingDeliveriesCount,
        kitchenPreparedToday: kitchenPreparedTodayCount
      },
      charts: {
        revenue7Days,
        revenue30Days,
        categoryPopularity: categoryAgg.length > 0 ? categoryAgg : [],
        topItems: topItemsAgg,
        peakHours: formattedPeakHours
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error generating analytics', error: error.message });
  }
};

// @desc    Get public live status
// @route   GET /api/analytics/live-status
// @access  Public
const getLiveStatus = async (req, res) => {
  try {
    res.json({
      occupancy: Math.floor(Math.random() * 40) + 40, // 40-80%
      tablesAvailable: Math.floor(Math.random() * 5) + 2, // 2-6
      waitTime: Math.floor(Math.random() * 15) + 5, // 5-20 mins
      trendingDish: 'Chicken Biryani'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching live status' });
  }
};

export { getAnalytics, getLiveStatus };

