const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NGO = require('../models/NGO');
const { protect, allowRoles } = require('../middleware/auth');

// ── POST /api/ngos/register ─────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    console.log('📝 [NGO REGISTER] Request received:', JSON.stringify(req.body, null, 2));
    
    const { organizationName, registrationNumber, establishedYear,
      headName, phone, email, password, registeredAddress,
      totalWorkers, trainedRescueWorkers, pastExperience } = req.body;

    const existing = await NGO.findOne({ $or: [{ email }, { registrationNumber }] });
    if (existing) {
      console.log('⚠️ [NGO] Email/Registration number already exists');
      return res.status(400).json({ error: 'Email or registration number already exists' });
    }

    const ngo = await NGO.create({
      organizationName, registrationNumber, establishedYear,
      headName, phone, email, password, registeredAddress,
      totalWorkers, trainedRescueWorkers, pastExperience,
    });

    console.log('✅ [NGO SAVED TO DB]:', ngo._id, '| Organization:', organizationName);

    const token = jwt.sign(
      { id: ngo._id, role: 'ngo', name: ngo.organizationName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      success: true,
      message: 'NGO registered successfully', 
      token,
      ngoId: ngo._id 
    });
  } catch (err) {
    console.error('❌ [NGO REGISTER ERROR]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ngos/login ────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    console.log('📝 [NGO LOGIN] Request received for email:', req.body.email);
    
    const { email, password } = req.body;
    const ngo = await NGO.findOne({ email });
    if (!ngo) {
      console.log('❌ [NGO LOGIN] Email not found:', email);
      return res.status(404).json({ error: 'Email not found' });
    }

    const match = await bcrypt.compare(password, ngo.password);
    if (!match) {
      console.log('❌ [NGO LOGIN] Incorrect password for:', email);
      return res.status(401).json({ error: 'Incorrect password' });
    }

    console.log('✅ [NGO LOGIN] Success for:', email);

    const token = jwt.sign(
      { id: ngo._id, role: 'ngo', name: ngo.organizationName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, ngoId: ngo._id, organizationName: ngo.organizationName });
  } catch (err) {
    console.error('❌ [NGO LOGIN ERROR]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ngos/offer ────────────────────────────────────────
// NGO submits aid capabilities for an active disaster
router.post('/offer', protect, allowRoles('ngo'), async (req, res) => {
  try {
    const { capabilities, capacityDetails, deploymentTimeline } = req.body;
    await NGO.findByIdAndUpdate(req.user.id, {
      capabilities, capacityDetails, deploymentTimeline
    });
    req.io.emit('ngo-offer', { ngoId: req.user.id, capabilities, deploymentTimeline });
    res.json({ message: 'Aid offer submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ngos/all ───────────────────────────────────────────
router.get('/all', protect, allowRoles('admin'), async (req, res) => {
  try {
    const ngos = await NGO.find().select('-password').sort({ createdAt: -1 });
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;