const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

// Create order (user checkout)
const createOrder = async (req, res) => {
  try {
    const { customerId, items, discount = 0, tax = 0, paymentMethod = 'cash' } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items required' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Validate products and check stock
    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${it.product}` });
      }
      const qty = parseInt(it.quantity || 0, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product ${product.productName}` });
      }
      if (product.quantity < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.productName}` });
      }
      const price = product.price;
      subtotal += price * qty;
      orderItems.push({
        product: product._id,
        name: product.productName,
        quantity: qty,
        price
      });
    }

    const totalAmount = Math.max(subtotal - (discount || 0) + (tax || 0), 0);

    // Deduct stock and log inventory movements
    for (const it of items) {
      const qty = parseInt(it.quantity || 0, 10);
      await Product.findByIdAndUpdate(it.product, { $inc: { quantity: -qty } });

      await Inventory.create({
        product: it.product,
        type: 'sale',
        quantity: -qty,
        reason: `Sold in orderORD-${Date.now()}`
      });
    }

    // Process customer metrics and loyalty points
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId);
      if (customer) {
        customer.totalPurchases += totalAmount;
        // Award 1 loyalty point for every ₹100 spent
        const pointsEarned = Math.floor(totalAmount / 100);
        customer.loyaltyPoints += pointsEarned;
        await customer.save();
      }
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = await Order.create({
      orderId,
      customer: customer ? customer._id : undefined,
      createdBy: req.user?.id,
      items: orderItems,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      status: 'completed'
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders list (paginated)
const getOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const filter = {};

    // Filter by customer if provided
    if (req.query.customerId) {
      filter.customer = req.query.customerId;
    }

    // Cashiers only see their own sales on their personal listings, admins see everything
    if (req.user && req.user.role !== 'admin') {
      filter.createdBy = req.user.id;
    } else if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const total = await Order.countDocuments(filter);
    const data = await Order.find(filter)
      .populate('createdBy', 'name email')
      .populate('customer', 'customerName phone email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('customer', 'customerName phone email address loyaltyPoints');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Block regular users from viewing other employees' orders
    if (req.user.role !== 'admin' && order.createdBy?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden access to this order' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { paymentMethod, status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (status) order.status = status;

    await order.save();
    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Replenish stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
      await Inventory.create({
        product: item.product,
        type: 'adjustment',
        quantity: item.quantity,
        reason: `Restocked due to order cancellation ${order.orderId}`
      });
    }

    // Deduct total purchases and loyalty points from customer
    if (order.customer) {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        customer.totalPurchases = Math.max(customer.totalPurchases - order.totalAmount, 0);
        const pointsEarned = Math.floor(order.totalAmount / 100);
        customer.loyaltyPoints = Math.max(customer.loyaltyPoints - pointsEarned, 0);
        await customer.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin dashboard stats require admin role' });
    }

    // Revenue and Sales counts
    const completedOrdersFilter = { status: 'completed' };
    const totalRevenueAgg = await Order.aggregate([
      { $match: completedOrdersFilter },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalSales: { $sum: 1 } } }
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalSales = totalRevenueAgg[0]?.totalSales || 0;

    // Total counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Inventory Alerts (low stock < 10)
    const lowStockAlerts = await Product.find({ quantity: { $lt: 10 } }).populate('category', 'name');
    const lowStockCount = lowStockAlerts.length;

    // Sales analytics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySalesAgg = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          sales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySales = monthlySalesAgg.map(item => {
      return {
        month: `${monthNames[item._id.month - 1]}`,
        sales: item.sales
      };
    });

    // Employee stats
    const employees = await User.find({ role: 'user' }).select('name email status');
    const employeeStats = [];
    for (const emp of employees) {
      const empOrdersCount = await Order.countDocuments({ createdBy: emp._id });
      const empSalesAgg = await Order.aggregate([
        { $match: { createdBy: emp._id, status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]);
      employeeStats.push({
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        status: emp.status,
        ordersCount: empOrdersCount,
        totalSales: empSalesAgg[0]?.totalRevenue || 0
      });
    }

    res.status(200).json({
      totalRevenue,
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      lowStockAlerts: lowStockAlerts.map(p => ({ _id: p._id, name: p.productName, quantity: p.quantity })),
      monthlySales,
      employeeStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  getDashboardStats
};
