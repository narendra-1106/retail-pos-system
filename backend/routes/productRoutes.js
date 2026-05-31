const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

router.use(protect);

router.post("/add", addProduct);

router.get("/", getProducts);

router.delete("/:id", deleteProduct);

router.put("/:id", updateProduct);
module.exports = router;