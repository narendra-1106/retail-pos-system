const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  getDashboardStats
} = require("../controllers/orderController");

router.use(protect);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/stats", getDashboardStats);
router.get("/:id", getOrderById);

module.exports = router;
