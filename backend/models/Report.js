const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: { type: String, enum: ['sales', 'inventory', 'customer'], required: true },
  period: { type: String, required: true }, // 'daily', 'weekly', 'monthly', 'all'
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
