const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Report = require('../models/Report');

// Get Sales Report
const getSalesReport = async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly'
    let matchFilter = { status: 'completed' };

    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = null;
    }

    if (startDate) {
      matchFilter.createdAt = { $gte: startDate };
    }

    const orders = await Order.find(matchFilter).populate('customer', 'customerName phone');

    // Summarize
    let totalSales = orders.length;
    let totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    let totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
    let totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);

    const paymentMethods = {};
    orders.forEach(o => {
      paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + o.totalAmount;
    });

    const reportData = {
      period: period || 'all',
      totalSales,
      totalRevenue,
      totalDiscount,
      totalTax,
      paymentMethodBreakdown: paymentMethods,
      orders: orders.map(o => ({
        orderId: o.orderId,
        customerName: o.customer?.customerName || 'Walk-in',
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        date: o.createdAt
      }))
    };

    // Optionally save in Report collection
    await Report.create({
      reportType: 'sales',
      period: period || 'all',
      generatedBy: req.user.id,
      data: reportData
    });

    res.status(200).json(reportData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Inventory Report
const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name');

    const totalValuation = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockItems = products.filter(p => p.quantity < 10).length;

    const reportData = {
      totalValuation,
      totalItems,
      lowStockItems,
      products: products.map(p => ({
        productName: p.productName,
        barcode: p.barcode || 'N/A',
        price: p.price,
        quantity: p.quantity,
        valuation: p.price * p.quantity,
        status: p.status
      }))
    };

    await Report.create({
      reportType: 'inventory',
      period: 'all',
      generatedBy: req.user.id,
      data: reportData
    });

    res.status(200).json(reportData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Customer Report
const getCustomerReport = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ totalPurchases: -1 });

    const reportData = {
      totalCustomers: customers.length,
      topCustomers: customers.map(c => ({
        customerName: c.customerName,
        phone: c.phone || 'N/A',
        email: c.email || 'N/A',
        totalPurchases: c.totalPurchases,
        loyaltyPoints: c.loyaltyPoints
      }))
    };

    await Report.create({
      reportType: 'customer',
      period: 'all',
      generatedBy: req.user.id,
      data: reportData
    });

    res.status(200).json(reportData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export report as CSV
const exportReportToCsv = async (req, res) => {
  try {
    const { type, period } = req.query; // 'sales', 'inventory', 'customer'
    let csvContent = "";
    let filename = "";

    if (type === 'sales') {
      let matchFilter = { status: 'completed' };
      const now = new Date();
      let startDate = new Date();

      if (period === 'daily') startDate.setHours(0, 0, 0, 0);
      else if (period === 'weekly') startDate.setDate(now.getDate() - 7);
      else if (period === 'monthly') startDate.setMonth(now.getMonth() - 1);
      else startDate = null;

      if (startDate) matchFilter.createdAt = { $gte: startDate };

      const orders = await Order.find(matchFilter).populate('customer', 'customerName');

      csvContent = "Order ID,Customer,Total Amount,Payment Method,Date\n";
      orders.forEach(o => {
        const cName = o.customer?.customerName || "Walk-in";
        csvContent += `"${o.orderId}","${cName}",${o.totalAmount},"${o.paymentMethod}","${o.createdAt.toISOString()}"\n`;
      });
      filename = `sales_report_${period || 'all'}.csv`;

    } else if (type === 'inventory') {
      const products = await Product.find({});
      csvContent = "Product Name,Barcode,Price,Quantity,Valuation\n";
      products.forEach(p => {
        csvContent += `"${p.productName}","${p.barcode || 'N/A'}",${p.price},${p.quantity},${p.price * p.quantity}\n`;
      });
      filename = "inventory_report.csv";

    } else if (type === 'customer') {
      const customers = await Customer.find({}).sort({ totalPurchases: -1 });
      csvContent = "Customer Name,Phone,Email,Total Purchases,Loyalty Points\n";
      customers.forEach(c => {
        csvContent += `"${c.customerName}","${c.phone || 'N/A'}","${c.email || 'N/A'}",${c.totalPurchases},${c.loyaltyPoints}\n`;
      });
      filename = "customer_report.csv";
    } else {
      return res.status(400).json({ message: 'Invalid report type for export' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  exportReportToCsv
};
