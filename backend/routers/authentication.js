const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const Role = require('../models/userRoles');
const authMiddleware = require('../middlewares/userAthu');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, phone, email, role, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the "client" role from the Role collection
    let assignedRole = await Role.findOne({ name: 'CLIENT' });

    if (!assignedRole) {
      return res.status(400).json({ message: 'Default role "client" not found' });
    }

    // If a role is provided and exists, use it; otherwise, assign "client" role
    if (role) {
      const customRole = await Role.findById(role);
      if (customRole) {
        assignedRole = customRole;
      }
    }

    // Create new user with assigned role
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      role: assignedRole._id, // Store role ID
      password: hashedPassword
    });

    // Save user
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', newUser });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone }).populate('role');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
   res.json({ 
  token, 
  role: user.role.name,  // Ensure the user document has a 'role' field
  _id: user._id,
  privileges: user.role.privileges || [] // Add privileges if needed
});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


//router to fetch user profile data
// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Profile
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body }, // Update with new data
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});


router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// const twilio = require('twilio');
// const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// // Temporary store for OTPs (use Redis for production)
// const otpStore = new Map();

// router.post('/login', async (req, res) => {
//   const { phone, password } = req.body;
//   try {
//     const user = await User.findOne({ phone }).populate('role');
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     otpStore.set(phone, otp);

//     // Send OTP
//     await client.messages.create({
//       body: `Your OTP is ${otp}`,
//       to: `+25${phone}`, // Assuming Rwandan phone format
//       from: process.env.TWILIO_PHONE_NUMBER,
//     });

//     return res.status(200).json({ message: 'OTP sent to your phone', phone });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.post('/verify-otp', async (req, res) => {
//   const { phone, otp } = req.body;
//   const storedOtp = otpStore.get(phone);

//   if (!storedOtp || storedOtp !== otp) {
//     return res.status(400).json({ message: 'Invalid or expired OTP' });
//   }

//   otpStore.delete(phone); // Remove OTP after successful verification

//   const user = await User.findOne({ phone }).populate('role');
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

//   return res.json({
//     token,
//     role: user.role.name,
//     privileges: user.role.privileges || []
//   });
// });

module.exports = router;