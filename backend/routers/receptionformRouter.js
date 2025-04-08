const express = require('express');
const router = express.Router();
const FuelOperation = require('../models/FuelOperation');

// Add new record
router.post('/create', async (req, res) => {
  try {
    const newOperation = new FuelOperation(req.body);
    await newOperation.save();
    res.status(201).json(newOperation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// Get all records
router.get('/', async (req, res) => {
  try {
    const records = await FuelOperation.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

module.exports = router;
