
const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const upload = require('../middlewares/upload');
const multer = require('multer');
const path = require('path');
const Role = require('../models/userRoles')


// *admin for *Update User (Including Role)**
router.put('/:id', async (req, res) => {
  console.log(req.body); // Debugging output
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  try {
    const { firstName, lastName, phone, email, role } = req.body;
    const userId = req.params.id;

    let updateData = { firstName, lastName, phone, email };
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate('role');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/fetchUsers', async (req, res) => {
  try {
    const { includeAdmins } = req.query;

    let query = {};
    
    if (includeAdmins !== 'true') {
      // Fetch the admin role ObjectId
      const adminRole = await Role.findOne({ name: 'ADMIN' });
      
      // If admin role is not found, return an error
      if (!adminRole) {
        return res.status(404).json({ error: 'Admin role not found' });
      }

      // Query to exclude users with the 'admin' role
      query = { role: { $ne: adminRole._id } }; // Exclude users with admin role
    }

    // Fetch users excluding admins (if applicable)
    const users = await User.find(query)
                            .populate('role', 'name') // Populating the role name, assuming 'role' is an ObjectId
                            .exec();

    // Respond with the fetched users
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
