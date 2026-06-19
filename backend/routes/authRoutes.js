const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getUsers,
  sendOtp,
  verifyOtp
} = require("../controllers/authController");

const { authenticateUser, authorizeAdmin } = require("../middleware/authMiddleware");


router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.get("/", authenticateUser, authorizeAdmin, getUsers);


module.exports = router;