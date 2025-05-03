const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const Role = require('../models/userRoles');
const sendEmail = require('../2FA/sendmailcode'); 
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

    // If 2FA is enabled, generate and send code
    if (user.twoFAEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFACode = code;
      user.twoFACodeExpires = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins
      await user.save();

      await sendEmail(
        user.email,
        'Your 2FA Code',
        `Dear ${user.firstName?.toUpperCase() || 'User'},\n\nUse this code to confirm your account (${code}).\n\nCheers,\nKigali diesel service Team`
      );

      return res.status(200).json({ 
        message: '2FA code sent to email', 
        requires2FA: true,
        email: user.email,
        userId: user._id  // optionally return this to reference in next step
      });
    }

    // If 2FA is NOT enabled → proceed with login
    const payload = {
      id: user.role._id,
      name: user.role.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name, // ✅ send role as string
        phone: user.phone
      }
    });
    

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


//to send code sent to email to be verified
router.post('/verify-2fa', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email }).populate('role');
    if (
      !user || 
      String(user.twoFACode) !== String(code) || 
      user.twoFACodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Clear 2FA code
    user.twoFACode = undefined;
    user.twoFACodeExpires = undefined;
    await user.save();

    // Now generate token and return user info
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      role: user.role.name,
      _id: user._id,
      privileges: user.role.privileges || [],
      message: '2FA verified successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/authentication/toggle-2fa
router.put('/enable-disable-2fa', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.twoFAEnabled = !user.twoFAEnabled;
  await user.save();

  res.json({ message: `2FA ${user.twoFAEnabled ? 'enabled' : 'disabled'}`, twoFAEnabled: user.twoFAEnabled });
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



module.exports = router;