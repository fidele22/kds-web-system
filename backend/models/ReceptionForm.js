const mongoose = require('mongoose');

const receptionFormSchema = new mongoose.Schema({
  receivedTool: {
    type: String,
    required: true,
  },
  receivedToolNumber: {
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
  issueDiscoveredBy: {
    type: mongoose.Schema.Types.ObjectId, // or String if you store user name
    ref: 'Users', 
    required: false,
  },
  issueSolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: false,
  },
  amountPaid: {
    type: Number,
    required: false,
    default:'0'
  },
  paymentMethod: {
    type: String,
    enum: ['Non Applicable','Cash', 'Mobile Money', 'Bank Transfer', 'Other'], // customize as needed
    required: false,
    default: 'Non Applicable'
  },
  
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Uncompleted', 'Paid', 'UnPaid', 'Returned to Owner'],
    default: 'Pending',
  },
  image: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('ReceptionData', receptionFormSchema);
