const mongoose = require("mongoose");

const connectDB = async () => {
  const connString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/retailPOS";

  try {
    const conn = await mongoose.connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected 🚀 host: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;