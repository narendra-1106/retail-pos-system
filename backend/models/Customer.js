const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, index: true },
  email: { type: String, index: true },
  address: { type: String },
  totalPurchases: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Virtuals for compatibility
customerSchema.virtual('name').get(function() {
  return this.customerName;
}).set(function(v) {
  this.customerName = v;
});

customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
