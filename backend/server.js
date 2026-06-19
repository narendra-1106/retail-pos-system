const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendBuildPath));

app.get("/*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

