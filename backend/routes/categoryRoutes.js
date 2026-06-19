const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

// public for authenticated users: GET
router.get('/', authenticateUser, getCategories);

// admin only
router.post('/', authenticateUser, authorizeAdmin, createCategory);
router.put('/:id', authenticateUser, authorizeAdmin, updateCategory);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteCategory);

module.exports = router;
