// routes/authentication.js
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // update path as needed

const router = express.Router();

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const token = crypto.randomBytes(20).toString('hex');
      const expiry = Date.now() + 3600000; // 1 hour
  
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expiry;
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // use your email provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });
  
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        html: `
          <p>You requested a password reset</p>
          <p><a href="${resetLink}">Click here to reset your password</a></p>
          <p>This link expires in 1 hour.</p>
        `
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Reset email sent successfully' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
  
      if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
  
      user.password = password; // make sure to hash in your User model pre-save hook
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      await user.save();
  
      res.json({ message: 'Password reset successful' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;