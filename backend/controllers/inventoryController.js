const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Restock a product
const restockProduct = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update quantity
    product.quantity += parseInt(quantity, 10);
    await product.save();

    // Log movement
    const log = await Inventory.create({
      product: productId,
      type: 'restock',
      quantity: parseInt(quantity, 10),
      reason: reason || 'Purchase/Restock'
    });

    res.status(200).json({ message: 'Product restocked successfully', product, log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manually adjust inventory
const adjustProductStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body; // quantity can be positive or negative
    if (!productId || quantity === undefined || quantity === 0) {
      return res.status(400).json({ message: 'Product ID and non-zero quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if adjustment would drop quantity below 0
    const newQty = product.quantity + parseInt(quantity, 10);
    if (newQty < 0) {
      return res.status(400).json({ message: 'Adjustment results in negative stock' });
    }

    product.quantity = newQty;
    await product.save();

    const log = await Inventory.create({
      product: productId,
      type: 'adjustment',
      quantity: parseInt(quantity, 10),
      reason: reason || 'Manual adjustment'
    });

    res.status(200).json({ message: 'Product stock adjusted successfully', product, log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all inventory movements (paginated)
const getInventoryLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const type = req.query.type; // restock, sale, adjustment
    const filter = {};
    if (type) filter.type = type;

    const total = await Inventory.countDocuments(filter);
    const data = await Inventory.find(filter)
      .populate('product', 'productName price barcode')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ date: -1 });

    res.status(200).json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold || '10', 10);
    const lowStock = await Product.find({ quantity: { $lt: threshold } }).populate('category', 'name');
    res.status(200).json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  restockProduct,
  adjustProductStock,
  getInventoryLogs,
  getLowStockAlerts
};
