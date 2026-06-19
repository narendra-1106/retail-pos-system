const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

router.get('/', authenticateUser, getCustomers);
router.post('/', authenticateUser, [ body('name').notEmpty().withMessage('name required') ], validateRequest, createCustomer);
router.get('/:id', authenticateUser, getCustomerById);
router.put('/:id', authenticateUser, authorizeAdmin, updateCustomer);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteCustomer);

module.exports = router;
