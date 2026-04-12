const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect, allowRoles } = require('../middleware/auth');
const Victim = require('../models/Victim');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Incident = require('../models/Incident');

// ── POST /api/admin/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    // Simple hardcoded admin credentials
    // In production, store this in DB with hashed password
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@resqnet.gov';
    const ADMIN_PASS  = process.env.ADMIN_PASS  || 'Admin@123';
    const ADMIN_CODE  = process.env.ADMIN_CODE  || '123456';

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS || adminCode !== ADMIN_CODE) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: 'admin', role: 'admin', name: 'System Administrator' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Admin login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/dashboard ────────────────────────────────────
// Full stats for admin dashboard
router.get('/dashboard', protect, allowRoles('admin'), async (req, res) => {
  try {
    const [
      totalVictims, pendingVictims, resolvedVictims,
      totalVolunteers, activeVolunteers,
      totalNGOs,
      totalIncidents, criticalIncidents,
    ] = await Promise.all([
      Victim.countDocuments(),
      Victim.countDocuments({ status: { $in: ['pending','reviewing'] } }),
      Victim.countDocuments({ status: 'resolved' }),
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ isActive: true }),
      NGO.countDocuments(),
      Incident.countDocuments({ isResolved: false }),
      Incident.countDocuments({ isResolved: false, priorityLevel: 'CRITICAL' }),
    ]);

    console.log('Dashboard Stats:', {
      totalVictims, pendingVictims, resolvedVictims,
      totalVolunteers, activeVolunteers,
      totalNGOs,
      totalIncidents, criticalIncidents,
    });

    const topVictims = await Victim.find({ status: { $ne: 'resolved' } })
      .select('-password')
      .populate('assignedVolunteer', 'name phone')
      .sort({ priorityScore: -1 })
      .limit(10);

    console.log('Top Victims:', topVictims);

    const topIncidents = await Incident.find({ isResolved: false })
      .sort({ priorityScore: -1 })
      .limit(10);

    console.log('Top Incidents:', topIncidents);

    const availableVolunteers = await Volunteer.find({ isActive: true, currentTaskId: null })
      .select('name phone coordinates tasksCompleted')
      .limit(20);

    console.log('Available Volunteers:', availableVolunteers);

    res.json({
      stats: { totalVictims, pendingVictims, resolvedVictims, totalVolunteers, activeVolunteers, totalNGOs, totalIncidents, criticalIncidents },
      topVictims,
      topIncidents,
      availableVolunteers,
    });
  } catch (err) {
    console.error('Error in /dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;