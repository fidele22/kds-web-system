const express = require('express');
const router = express.Router();
const multer = require('multer');
const ReceptionForm = require('../models/ReceptionForm');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'photos/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST: Submit new reception form
router.post('/send-receptionForm', upload.single('image'), async (req, res) => {
  try {
    const {
      receivedTool,
      receivedToolNumber,
      plate,
      issueDescription,
      owner,
      phoneNumber,
      status
    } = req.body;

    const form = new ReceptionForm({
      receivedTool,
      receivedToolNumber,
      plate,
      issueDescription: JSON.parse(issueDescription), // since frontend sends it as stringified array
      owner,
      phoneNumber,
      status,
      image: req.file ? req.file.path : null
    });

    await form.save();
    res.status(201).json({ message: 'Form submitted successfully', data: form });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET: Fetch all forms (optional)
router.get('/view-receptionForm', async (req, res) => {
  try {
    const forms = await ReceptionForm.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch forms', error: err });
  }
});
// GET: Fetch only "In Progress" forms
router.get('/view-pending-task', async (req, res) => {
  try {
    const forms = await ReceptionForm.find({ status: 'Pending', }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch forms', error: err });
  }
});
// GET: Fetch completed tasks discovered by specific user
router.get('/view-completed-task/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const forms = await ReceptionForm.find({
      status: { $in: ['In Progress','Completed', 'Uncompleted'] },
      issueDiscoveredBy: userId
    });
    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
});


//updating status make
const statusTransitions = {
  'Pending': ['In Progress'],
  'In Progress': ['Completed', 'Uncompleted'],
  'Completed': ['Returned to Owner'],
  'Uncompleted': ['Returned to Owner'],
  'Returned to Owner': [],
};

router.put('/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const form = await ReceptionForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const allowedStatuses = statusTransitions[form.status] || [];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${form.status} to ${status}` });
    }

    form.status = status;
    await form.save();
    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});
// GET /api/reception-form/:id
router.get('/get-reception-form/:id', async (req, res) => {
  try {
    const reception = await ReceptionForm.findById(req.params.id);
    res.json(reception);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching reception form' });
  }
});

router.put('/add-checkup-data/:id', async (req, res) => {
  const { id } = req.params;
  const {
    receivedTool,
    plate,
    owner,
    phoneNumber,
    issueDiscovered,
    issueSolved,
    issueDiscoveredBy,
    issueSolvedBy,
  } = req.body;

  try {
    const updatedData = {
      receivedTool,
      plate,
      owner,
      phoneNumber,
      issueDiscovered,
      issueSolved,
      issueDiscoveredBy,
      issueSolvedBy,
      status: 'In Progress'
    };

    const updatedReception = await ReceptionForm.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedReception) {
      return res.status(404).json({ message: 'Reception form not found' });
    }

    res.status(200).json(updatedReception);
  } catch (error) {
    console.error('Error updating reception form:', error);
    res.status(500).json({ message: 'Server error while updating reception form' });
  }
});


module.exports = router;
