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
      receptionNumber,
      plate,
      issueDescription,
      owner,
      phoneNumber,
      status
    } = req.body;

    const form = new ReceptionForm({
      receivedTool,
      receptionNumber,
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
    issueSolved
    // Don't destructure `status` to avoid using the one from the frontend
  } = req.body;

  try {
    // Always set status to "In Progress" when updating
    const updatedData = {
      receivedTool,
      plate,
      owner,
      phoneNumber,
      issueDiscovered,
      issueSolved,
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
