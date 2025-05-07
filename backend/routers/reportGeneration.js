const express = require('express');
const router = express.Router();
const StockTool = require('../models/stockTools');
const StockHistory = require('../models/StockToolHistory');
const ReceptionForm = require('../models/ReceptionForm');

// GET /api/reception/monthly-report?month=2025-04
router.get('/monthly-report', async (req, res) => {
    const { month } = req.query;
  
    if (!month) return res.status(400).json({ error: 'Month is required' });
  
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);
  
    try {
      const records = await ReceptionForm.find({
        createdAt: { $gte: startDate, $lte: endDate },
        amountPaid: { $nin: [null, 0, '', '0'] }
      });
  
      res.json(records);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  router.get('/paid-monthly-report', async (req, res) => {
    const { month } = req.query;
    const [year, monthNumber] = month.split('-');
  
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 0, 23, 59, 59);
  
    const paidRecords = await ReceptionForm.find({
      createdAt: { $gte: start, $lte: end },
      amountPaid: {
        $nin: [null, 0, '', '0']
      }
    });
  
    res.json(paidRecords);
  });
  

router.get('/stock-monthly-report', async (req, res) => {
  const { month, year } = req.query;

  try {
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    // Step 1: Get history within selected month
    const history = await StockHistory.find({
      date: { $gte: start, $lt: end }
    }).populate('itemId');

    // Step 2: Get items created in selected month
    const newItems = await StockTool.find({
      createdAt: { $gte: start, $lt: end }
    }).lean();

    const itemsWithHistoryMap = {};
    history.forEach(h => {
      const key = h.itemId?._id?.toString();
      if (!itemsWithHistoryMap[key]) itemsWithHistoryMap[key] = [];
      itemsWithHistoryMap[key].push(h);
    });

    // Step 3: Prepare final results
    const report = [];

    // Add items with removal history
    for (const [itemIdStr, entries] of Object.entries(itemsWithHistoryMap)) {
      entries.forEach(h => {
        report.push({
          itemId: h.itemId,
          partremoved: h.partremoved,
          removedDate: h.date,
          createdDate: h.itemId.createdAt
        });
      });
    }

    // Add new items created in this month with no removal
    for (const item of newItems) {
      const alreadyIncluded = report.find(r => r.itemId._id.toString() === item._id.toString());
      if (!alreadyIncluded) {
        report.push({
          itemId: item,
          partremoved: '—',
          removedDate: null,
          createdDate: item.createdAt
        });
      }
    }

    res.json(report);
  } catch (err) {
    console.error('Error fetching monthly report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});
  module.exports = router;