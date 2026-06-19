const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Create order (user checkout)
const createOrder = async (req, res) => {
  try {
    const { customerId, items, discount = 0, tax = 0, paymentMethod = 'cash' } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items required' });
    }

    // validate items and compute subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) return res.status(400).json({ message: `Product not found: ${it.product}` });
      const qty = parseInt(it.quantity || 0, 10);
      if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });
      if (product.stock < qty) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      const price = product.price;
      subtotal += price * qty;
      orderItems.push({ product: product._id, name: product.name, quantity: qty, price });
    }

    const totalAmount = subtotal - (discount || 0) + (tax || 0);

    // decrement stock (atomicity note: consider transactions in prod)
    for (const it of items) {
      const qty = parseInt(it.quantity || 0, 10);
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -qty } });
    }

    // optional customer
    let customer = null;
    if (customerId) customer = await Customer.findById(customerId);

    const order = await Order.create({
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders (admin sees all, user sees own) with pagination
const getOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const filter = {};
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== 'admin') filter.createdBy = req.user.id;
    if (req.query.status) filter.status = req.query.status;

    const total = await Order.countDocuments(filter);
    const data = await Order.find(filter)
      .populate('createdBy', 'name email')
      .populate('customer', 'name phone email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('createdBy', 'name email').populate('customer', 'name phone email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.createdBy?._id.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin required' });
    const totalRevenueAgg = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalOrders = totalRevenueAgg[0]?.totalOrders || 0;
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    res.status(200).json({ totalRevenue, totalOrders, totalProducts, totalCustomers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, getDashboardStats };
