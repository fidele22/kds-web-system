const mongoose = require('mongoose');

const itemHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockTool', required: true },
  partremoved: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StockHistory', itemHistorySchema);
