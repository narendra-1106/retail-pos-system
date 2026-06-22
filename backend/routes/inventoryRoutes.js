const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const {
  restockProduct,
  adjustProductStock,
  getInventoryLogs,
  getLowStockAlerts
} = require('../controllers/inventoryController');

// All inventory routes are protected
router.use(authenticateUser);

router.get('/logs', getInventoryLogs);
router.get('/alerts', getLowStockAlerts);

// Management routes require admin role
router.post('/restock', authorizeAdmin, restockProduct);
router.post('/adjust', authorizeAdmin, adjustProductStock);

module.exports = router;
