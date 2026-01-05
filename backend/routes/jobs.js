const express = require('express');
const router = express.Router();
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const Job = require('../models/Job');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Owner)
router.post('/', authenticate, authorize('owner'), requireApproval, async (req, res) => {
  try {
    const jobData = { ...req.body, postedBy: req.userId };
    const job = new Job(jobData);
    await job.save();
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/jobs
// @desc    Get all job listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, city, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');
    
    const jobs = await Job.find(query)
      .populate('postedBy', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(query);
    
    res.json({ 
      success: true, 
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Driver)
router.post('/:id/apply', authenticate, authorize('driver'), requireApproval, async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Check if already applied
    const existingApplication = job.applications.find(
      app => app.driver.toString() === req.userId.toString()
    );
    
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    
    job.applications.push({
      driver: req.userId,
      coverLetter,
      status: 'pending'
    });
    
    await job.save();
    res.json({ success: true, message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
