const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['in-stock', 'removed'], default: 'in-stock' },
  removedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('StockTool', itemSchema);
