const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getUsers,
  sendOtp,
  verifyOtp
} = require("../controllers/authController");
const { forgotPassword, resetPassword, changePassword } = require('../controllers/passwordController');

const { authenticateUser, authorizeAdmin } = require("../middleware/authMiddleware");
const { authLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');



router.post("/register", authLimiter, [ body('name').notEmpty(), body('password').isLength({ min: 6 }) ], validateRequest, registerUser);

router.post("/login", authLimiter, [ body('email').isEmail(), body('password').notEmpty() ], validateRequest, loginUser);

router.post("/send-otp", authLimiter, [ body('identifier').notEmpty() ], validateRequest, sendOtp);

router.post("/verify-otp", authLimiter, [ body('identifier').notEmpty(), body('otp').notEmpty() ], validateRequest, verifyOtp);

router.post('/forgot-password', authLimiter, [ body('email').isEmail() ], validateRequest, forgotPassword);

router.post('/reset-password', authLimiter, [ body('userId').notEmpty(), body('token').notEmpty(), body('newPassword').isLength({ min: 6 }) ], validateRequest, resetPassword);

router.post('/change-password', authenticateUser, [ body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 }) ], validateRequest, changePassword);

router.get("/", authenticateUser, authorizeAdmin, getUsers);


module.exports = router;