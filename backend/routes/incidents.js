const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { protect, blockVictims } = require('../middleware/auth');
const { calculatePriorityScore, getPriorityLevel } = require('../middleware/priority');

// ── POST /api/incidents ─────────────────────────────────────────
// Volunteer / Admin / NGO submits a new incident
router.post('/', protect, blockVictims, async (req, res) => {
  try {
    console.log('📝 [INCIDENT POST] Request received:', JSON.stringify(req.body, null, 2));

    const { type, location, severity, peopleAffected, urgency, description, coordinates } = req.body;

    // Validate required fields
    if (!type || !location || !severity || !peopleAffected || !urgency) {
      console.log('⚠️ [INCIDENT POST] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: type, location, severity, peopleAffected, urgency' });
    }

    const score = calculatePriorityScore({
      severity, peopleAffected, urgency, createdAt: new Date()
    });

    console.log('ℹ️ [INCIDENT POST] Calculated priority score:', score);

    const incident = await Incident.create({
      type, location, severity, peopleAffected, urgency,
      description, coordinates,
      priorityScore: score,
      priorityLevel: getPriorityLevel(score),
      submittedBy: req.user.name,
      submittedByRole: req.user.role,
    });

    console.log('✅ [INCIDENT POST] Incident saved to DB:', incident._id);

    // Broadcast to all connected dashboard users via Socket.io
    req.io.emit('new-incident', incident);
    res.status(201).json({ message: 'Incident reported', priorityScore: score, incident });
  } catch (err) {
    console.error('❌ [INCIDENT POST ERROR]:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/incidents ──────────────────────────────────────────
// Get all active incidents sorted by priority (for dashboard map)
router.get('/', protect, blockVictims, async (req, res) => {
  try {
    console.log('📝 [INCIDENT GET] Fetching all active incidents');

    const incidents = await Incident.find({ isResolved: false })
      .sort({ priorityScore: -1 });

    console.log('✅ [INCIDENT GET] Fetched incidents:', incidents.length);
    res.json(incidents);
  } catch (err) {
    console.error('❌ [INCIDENT GET ERROR]:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/incidents/:id/resolve ───────────────────────────
router.patch('/:id/resolve', protect, blockVictims, async (req, res) => {
  try {
    console.log('📝 [INCIDENT RESOLVE] Resolving incident ID:', req.params.id);

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!incident) {
      console.log('⚠️ [INCIDENT RESOLVE] Incident not found:', req.params.id);
      return res.status(404).json({ error: 'Incident not found' });
    }

    console.log('✅ [INCIDENT RESOLVE] Incident resolved:', incident._id);

    req.io.emit('incident-resolved', { incidentId: req.params.id });
    res.json({ message: 'Incident resolved', incident });
  } catch (err) {
    console.error('❌ [INCIDENT RESOLVE ERROR]:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/incidents/stats ────────────────────────────────────
router.get('/stats', protect, blockVictims, async (req, res) => {
  try {
    console.log('📝 [INCIDENT STATS] Fetching incident statistics');

    const total = await Incident.countDocuments({ isResolved: false });
    const critical = await Incident.countDocuments({ isResolved: false, priorityLevel: 'CRITICAL' });
    const high = await Incident.countDocuments({ isResolved: false, priorityLevel: 'HIGH' });
    const resolvedToday = await Incident.countDocuments({
      isResolved: true,
      resolvedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    const totalAffected = await Incident.aggregate([
      { $match: { isResolved: false } },
      { $group: { _id: null, total: { $sum: '$peopleAffected' } } }
    ]);

    console.log('✅ [INCIDENT STATS] Statistics fetched');

    res.json({
      total, critical, high,
      resolvedToday,
      totalAffected: totalAffected[0]?.total || 0,
    });
  } catch (err) {
    console.error('❌ [INCIDENT STATS ERROR]:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;