const express = require('express');
const router = express.Router();
const StockTool = require('../models/stockTools');
const StockHistory = require('../models/StockToolHistory');
const ReceptionForm = require('../models/ReceptionForm');
const User = require('../models/Users');

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
      const selectedMonthStart = new Date(`${year}-${month}-01`);
      const selectedMonthEnd = new Date(`${year}-${month}-01`);
      selectedMonthEnd.setMonth(selectedMonthEnd.getMonth() + 1); // exclusive
  
      // 1. Get all items created on or before the selected month
      const eligibleItems = await StockTool.find({
        createdAt: { $lt: selectedMonthEnd }
      }).lean();
  
      if (eligibleItems.length === 0) {
        return res.json([]);
      }
  
      const itemIds = eligibleItems.map(item => item._id);
  
  // 2. Get stock history up to and including selected month
     const historyInMonth = await StockHistory.find({
       itemId: { $in: itemIds },
       date: { $lt: selectedMonthEnd }
     }).populate('itemId');
     
      const historyMap = {};
      historyInMonth.forEach(h => {
        const key = h.itemId?._id?.toString();
        if (!historyMap[key]) historyMap[key] = [];
        historyMap[key].push(h);
      });
  
      const report = [];
  
      for (const item of eligibleItems) {
        const itemIdStr = item._id.toString();
        const historyEntries = historyMap[itemIdStr] || [];
  
        // Determine correct status based on removedAt date
        let status = item.status;
        let removedAt = item.removedAt;
  
        if (item.removedAt && new Date(item.removedAt) >= selectedMonthEnd) {
          status = 'in-stock';
          removedAt = '—';
        } else if (!item.removedAt || new Date(item.removedAt) < selectedMonthStart) {
          removedAt = item.removedAt ? item.removedAt : '—';
        }
  
        if (historyEntries.length > 0) {
          historyEntries.forEach(h => {
            report.push({
              itemId: h.itemId,
              partremoved: h.partremoved,
              removedDate: h.date,
              createdDate: h.itemId.createdAt,
              status,
              removedAt,
            });
          });
        } else {
          report.push({
            itemId: item,
            partremoved: '—',
            removedDate: null,
            createdDate: item.createdAt,
            status,
            removedAt,
          });
        }
      }
  
      res.json(report);
    } catch (err) {
      console.error('Error generating stock monthly report:', err);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });
  
  //
  router.get('/search-by-tool', async (req, res) => {
    const { receivedTool, receivedToolNumber, plate, owner } = req.query;
  
    const query = {};
  
    if (receivedTool) query.receivedTool = new RegExp(receivedTool, 'i');
    if (receivedToolNumber) query.receivedToolNumber = new RegExp(receivedToolNumber, 'i');
    if (plate) query.plate = new RegExp(plate, 'i');
    if (owner) query.owner = new RegExp(owner, 'i');
  
    try {
      const tools = await ReceptionForm.find(query)
      .populate({ path: 'issueDiscoveredBy', model: 'Users', select: 'firstName lastName phone email' })
      .populate({ path: 'issueSolvedBy', model: 'Users', select: 'firstName lastName phone email' });
      
  
      res.json(tools);
    } catch (err) {
      console.error('Error in /search-by-tool:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  router.get('/search-by-engineer', async (req, res) => {
    try {
      const { name, phone } = req.query;
  
      // Build user search criteria
      const userCriteria = {};
      if (name) {
        const regex = new RegExp(name, 'i');
        userCriteria.$or = [{ firstName: regex }, { lastName: regex }];
      }
      if (phone) userCriteria.phone = phone;
  
      // Find matching users
      const matchedUsers = await User.find(userCriteria).select('_id');
  
      const userIds = matchedUsers.map(user => user._id);
  
      // Find repair data by user ID in either field
      
      const tools = await ReceptionForm.find({
        $or: [
          { issueSolvedBy: { $in: userIds } },
          { issueDiscoveredBy: { $in: userIds } },
        ],
      })
      .populate({ path: 'issueSolvedBy', model: 'Users' })
      .populate({ path: 'issueDiscoveredBy', model: 'Users' })

  
      res.json(tools);
    } catch (error) {
      console.error('Error in /search/by-engineer:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;