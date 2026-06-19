const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// public for authenticated users: GET
router.get('/', authenticateUser, getCategories);

// admin only
router.post('/', authenticateUser, authorizeAdmin,
	[ body('name').notEmpty().withMessage('name required') ],
	validateRequest,
	createCategory
);

router.put('/:id', authenticateUser, authorizeAdmin,
	[ body('name').optional().notEmpty().withMessage('name required') ],
	validateRequest,
	updateCategory
);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteCategory);

module.exports = router;
