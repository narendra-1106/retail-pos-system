const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

// list products for authenticated users
router.get('/', authenticateUser, getProducts);

// admin-only product management
router.post('/add', authenticateUser, authorizeAdmin, addProduct);
router.put('/:id', authenticateUser, authorizeAdmin, updateProduct);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteProduct);

module.exports = router;