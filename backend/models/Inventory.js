const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['restock', 'sale', 'adjustment'], required: true },
  quantity: { type: Number, required: true }, // positive for additions, negative for reductions
  reason: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);
