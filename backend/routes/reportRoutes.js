const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  exportReportToCsv
} = require('../controllers/reportController');

// All report routes are admin-only
router.use(authenticateUser, authorizeAdmin);

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);
router.get('/export', exportReportToCsv);

module.exports = router;
