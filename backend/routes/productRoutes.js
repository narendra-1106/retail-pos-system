const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

// list products for authenticated users
router.get('/', authenticateUser, getProducts);

// admin-only product management
router.post('/add', authenticateUser, authorizeAdmin,
  [
    body('name').notEmpty().withMessage('name required'),
    body('category').notEmpty().withMessage('category required'),
    body('price').isNumeric().withMessage('price must be numeric')
  ],
  validateRequest,
  addProduct
);

router.put('/:id', authenticateUser, authorizeAdmin,
  [
    body('price').optional().isNumeric().withMessage('price must be numeric')
  ],
  validateRequest,
  updateProduct
);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteProduct);

module.exports = router;