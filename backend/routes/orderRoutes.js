const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const { createOrder, getOrders, getOrderById, getDashboardStats } = require('../controllers/orderController');

router.post('/', authenticateUser, [ body('items').isArray({ min: 1 }).withMessage('items required') ], validateRequest, createOrder);
router.get('/', authenticateUser, getOrders);
router.get('/stats', authenticateUser, authorizeAdmin, getDashboardStats);
router.get('/:id', authenticateUser, getOrderById);

module.exports = router;
