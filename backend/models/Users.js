const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role', // Reference the Role model
    required: true,
  },
  password: { type: String, required: true },
  twoFAEnabled: {
    type: Boolean,
    default: true, // or false if you want it off by default
  },
  
  // for resting password
  twoFACode: String,
  twoFACodeExpires: Date,

});

module.exports = mongoose.model('Users', UserSchema);