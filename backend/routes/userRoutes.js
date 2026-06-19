const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const { listUsers, getUser, createUser, updateUser, setUserStatus, deleteUser } = require('../controllers/userController');

// All routes are admin-only
router.use(authenticateUser, authorizeAdmin);

router.get('/', listUsers);
router.get('/:id', getUser);

router.post('/', [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'user'])
], validateRequest, createUser);

router.put('/:id', [
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'user']),
  body('status').optional().isIn(['active', 'inactive'])
], validateRequest, updateUser);

router.patch('/:id/status', [ body('status').isIn(['active', 'inactive']) ], validateRequest, setUserStatus);

router.delete('/:id', deleteUser);

module.exports = router;
