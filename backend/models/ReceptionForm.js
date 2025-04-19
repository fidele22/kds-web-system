const mongoose = require('mongoose');

const receptionFormSchema = new mongoose.Schema({
  receivedTool: {
    type: String,
    required: true,
  },
  receptionNumber: {
    type: String,
    required: true,
  },
  plate: {
    type: String,
    required: true,
  },
  issueDescription: {
    type: [String], 
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  //added by engineer
  issueDiscovered: {
    type: [String], 
    required: false,
  },
  issueSolved: {
    type: [String], 
    required: false,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Uncompleted', 'Returned to Owner'],
    default: 'Pending',
  },
  image: {
    type: String, // Path to the uploaded image file
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ReceptionData', receptionFormSchema);
