const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  barcode: { type: String, index: true },
  image: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Virtuals for compatibility with name and stock
productSchema.virtual('name').get(function() {
  return this.productName;
}).set(function(v) {
  this.productName = v;
});

productSchema.virtual('stock').get(function() {
  return this.quantity;
}).set(function(v) {
  this.quantity = v;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
