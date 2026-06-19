const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true
  },

  phone: {
    type: String,
    unique: true,
    sparse: true
  },

  password: {
    type: String
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  },

  status: {
    type: String,
    enum: ["active", "disabled"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("User", userSchema);