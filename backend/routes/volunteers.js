const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const Victim = require('../models/Victim');
const { protect, allowRoles } = require('../middleware/auth');

// ── POST /api/volunteers/register ──────────────────────────────
router.post('/register', async (req, res) => {
  try {
    console.log('📝 [VOLUNTEER REGISTER] Request received:', JSON.stringify(req.body, null, 2));
    
    const { name, phone, email, password, address, age, bloodGroup,
      experienceLevel, specialization, skillsDescription,
      aadhaarNumber, licenceNumber, availability, vehicleAvailable } = req.body;

    const existing = await Volunteer.findOne({ $or: [{ phone }, { email }] });
    if (existing) {
      console.log('⚠️ [VOLUNTEER] Phone/Email already exists');
      return res.status(400).json({ error: 'Phone or email already registered' });
    }

    const volunteer = await Volunteer.create({
      name, phone, email, password, address, age, bloodGroup,
      experienceLevel, specialization, skillsDescription,
      aadhaarNumber, licenceNumber, availability, vehicleAvailable,
    });

    console.log('✅ [VOLUNTEER SAVED TO DB]:', volunteer._id, '| Email:', email);

    const token = jwt.sign(
      { id: volunteer._id, role: 'volunteer', name: volunteer.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      success: true,
      message: 'Volunteer registered successfully', 
      token,
      volunteerId: volunteer._id 
    });
  } catch (err) {
    console.error('❌ [VOLUNTEER REGISTER ERROR]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/volunteers/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    console.log('📝 [VOLUNTEER LOGIN] Request received for email:', req.body.email);
    
    const { email, password } = req.body;
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      console.log('❌ [VOLUNTEER LOGIN] Email not found:', email);
      return res.status(404).json({ error: 'Email not found' });
    }

    const match = await bcrypt.compare(password, volunteer.password);
    if (!match) {
      console.log('❌ [VOLUNTEER LOGIN] Incorrect password for:', email);
      return res.status(401).json({ error: 'Incorrect password' });
    }

    console.log('✅ [VOLUNTEER LOGIN] Success for:', email);

    const token = jwt.sign(
      { id: volunteer._id, role: 'volunteer', name: volunteer.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, volunteerId: volunteer._id, name: volunteer.name });
  } catch (err) {
    console.error('❌ [VOLUNTEER LOGIN ERROR]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/volunteers/tasks ───────────────────────────────────
// Returns priority-sorted victims for the logged-in volunteer
router.get('/tasks', protect, allowRoles('volunteer'), async (req, res) => {
  try {
    const victims = await Victim.find({
      status: { $in: ['pending', 'reviewing', 'assigned'] }
    })
      .select('-password')
      .sort({ priorityScore: -1 })
      .limit(10);

    res.json(victims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/volunteers/complete/:victimId ────────────────────
// Volunteer marks a task as complete
router.patch('/complete/:victimId', protect, allowRoles('volunteer'), async (req, res) => {
  try {
    await Victim.findByIdAndUpdate(req.params.victimId, { status: 'resolved' });
    await Volunteer.findByIdAndUpdate(req.user.id, {
      $inc: { tasksCompleted: 1 },
      currentTaskId: null
    });
    req.io.emit('victim-resolved', { victimId: req.params.victimId });
    res.json({ message: 'Task marked complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/volunteers/all ─────────────────────────────────────
// Admin only
router.get('/all', protect, allowRoles('admin'), async (req, res) => {
  try {
    const volunteers = await Volunteer.find().select('-password').sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;