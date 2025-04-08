const mongoose = require('mongoose');

const FuelOperationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeOfOperation: { type: String, required: true },
  pumpNumber: { type: String, required: true },
  licensePlate: { type: String, required: true },
  operationStatus: { type: String, required: true },
  entryTime: { type: String, required: true },
  returnTime: { type: String, required: true },
  returnDetails: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FuelOperation', FuelOperationSchema);
