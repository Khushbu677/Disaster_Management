const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Victim = require('../models/Victim');
const { calculatePriorityScore, getPriorityLevel, injuryToSeverity, injuryToUrgency } = require('../middleware/priority');
const { protect, allowRoles } = require('../middleware/auth');

// ── POST /api/victims/register ──────────────────────────────────
// Called when victim submits the emergency registration form
router.post('/register', async (req, res) => {
  try {
    console.log('📝 [VICTIM REGISTER] Request received:', JSON.stringify(req.body, null, 2));
    
    const {
      name, phone, email, password, location, address,
      age, bloodGroup, aadhaarNumber,
      disasterType = 'Flood', injuryLevel = 'None — Stranded only', numberOfPeople = 1,
      hasChildrenOrElderly = 'No', additionalInfo = '', coordinates
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !password || !location || !disasterType || !injuryLevel) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, email, password, location, disasterType, injuryLevel' });
    }

    // Check if phone already registered
    const existing = await Victim.findOne({ phone });
    if (existing) {
      console.log('⚠️ [VICTIM] Phone already exists:', phone);
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Calculate priority score from injury data
    let severity = 5;
    let urgency = 1;
    
    if (injuryLevel.includes('Critical')) {
      severity = 9;
      urgency = 3;
    } else if (injuryLevel.includes('Moderate')) {
      severity = 6;
      urgency = 2;
    } else if (injuryLevel.includes('Minor')) {
      severity = 3;
      urgency = 1;
    } else if (injuryLevel.includes('None')) {
      severity = 1;
      urgency = 1;
    }

    const score = calculatePriorityScore({
      severity,
      peopleAffected: numberOfPeople || 1,
      urgency,
      createdAt: new Date(),
    });

    const priorityLevel = score >= 130 ? 'CRITICAL' : score >= 80 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    const victim = await Victim.create({
      name,
      phone,
      email,
      password,
      location,
      address,
      age: age || null,
      bloodGroup: bloodGroup || null,
      aadhaarNumber: aadhaarNumber || null,
      disasterType,
      injuryLevel,
      numberOfPeople: Number(numberOfPeople) || 1,
      hasChildrenOrElderly,
      additionalInfo,
      priorityScore: score,
      priorityLevel,
      coordinates: coordinates || { lat: null, lng: null },
    });

    console.log('✅ [VICTIM SAVED TO DB]:', victim._id, '| Phone:', phone, '| Ticket:', victim.ticketId);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ticketId: victim.ticketId,
      priorityScore: score,
      priorityLevel,
      status: victim.status,
    });

  } catch (err) {
    console.error('❌ [VICTIM REGISTER ERROR]:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/victims/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const victim = await Victim.findOne({ phone });
    if (!victim) return res.status(404).json({ error: 'Phone number not found' });

    const match = await bcrypt.compare(password, victim.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign(
      { id: victim._id, role: 'victim', name: victim.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      ticketId: victim.ticketId,
      status: victim.status,
      priorityScore: victim.priorityScore,
      assignedVolunteer: victim.assignedVolunteer,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/victims/status/:ticketId ──────────────────────────
// Victim tracks their rescue status using ticket ID
router.get('/status/:ticketId', async (req, res) => {
  try {
    const victim = await Victim.findOne({ ticketId: req.params.ticketId })
      .populate('assignedVolunteer', 'name phone coordinates');

    if (!victim) return res.status(404).json({ error: 'Ticket not found' });

    res.json({
      ticketId: victim.ticketId,
      status: victim.status,
      priorityScore: victim.priorityScore,
      priorityLevel: victim.priorityLevel,
      assignedVolunteer: victim.assignedVolunteer,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/victims/all ─────────────────────────────────────────
// Admin only — get all victims sorted by priority
router.get('/all', protect, allowRoles('admin'), async (req, res) => {
  try {
    const victims = await Victim.find({ status: { $ne: 'resolved' } })
      .select('-password')
      .populate('assignedVolunteer', 'name phone')
      .sort({ priorityScore: -1 });
    res.json(victims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/victims/:id/assign ───────────────────────────────
// Admin assigns a volunteer to a victim
router.patch('/:id/assign', protect, allowRoles('admin'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const victim = await Victim.findByIdAndUpdate(
      req.params.id,
      { assignedVolunteer: volunteerId, status: 'assigned' },
      { new: true }
    ).populate('assignedVolunteer', 'name phone');

    // Emit real-time update via Socket.io
    req.io.emit('victim-updated', victim);
    res.json({ message: 'Volunteer assigned', victim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/victims/:id/status ───────────────────────────────
router.patch('/:id/status', protect, allowRoles('admin','volunteer'), async (req, res) => {
  try {
    const { status } = req.body;
    const victim = await Victim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    req.io.emit('victim-updated', victim);
    res.json({ message: 'Status updated', victim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;