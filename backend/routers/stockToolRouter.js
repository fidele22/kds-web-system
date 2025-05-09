const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const StockTool = require('../models/stockTools');
const StockHistory = require('../models/StockToolHistory');


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'stockimage/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
// Create new item
router.post('/saveTool', upload.single('image'), async (req, res) => {
    const { name } = req.body;
    const image = req.file ? req.file.path : null;
    const newItem = new StockTool({ name, image });
    await newItem.save();
    res.status(201).json(newItem);
  });
  


// GET all stock items
router.get('/view-savedTool', async (req, res) => {
    try {
      const items = await StockTool.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch items', error });
    }
  });
  
  // PUT route to update status and set removed date
router.put('/update-stock-status/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const update = { status };
    if (status === 'removed') {
      update.removedAt = new Date();
    }

    const updatedItem = await StockTool.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item status', error });
  }
});


  router.post('/save-part-removed', async (req, res) => {
    const { itemId, partremoved } = req.body;
    try {
      const newHistory = new StockHistory({ itemId, partremoved });
      await newHistory.save();
      res.status(201).json({ message: 'History added' });
    } catch (error) {
      res.status(500).json({ error: 'Error saving history' });
    }
  });


  router.get('/tool/:id', async (req, res) => {
    const { id } = req.params;
  
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ObjectId format' });
    }
  
    try {
      const item = await StockTool.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving item', error });
    }
  });
  
 // Get stock history by itemId
router.get('/stockhistory/:itemId', async (req, res) => {
  try {
    const stockHistory = await StockHistory.find({ itemId: req.params.itemId }).sort({ date: -1 }); // Sort by date
    res.json(stockHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock history' });
  }
});

module.exports = router;
