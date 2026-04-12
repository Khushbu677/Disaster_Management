const express = require('express');
const Incident = require('../models/Incident');
const { calculatePriorityScore, getPriorityLevel } = require('../middleware/priority');

const router = express.Router();

function buildIncidentPayload(body) {
  const { type, location, severity, peopleAffected, urgency, description, coordinates } = body;
  const score = calculatePriorityScore({
    severity,
    peopleAffected,
    urgency,
    createdAt: new Date(),
  });

  return {
    type,
    location,
    severity,
    peopleAffected,
    urgency,
    description,
    coordinates,
    priorityScore: score,
    priorityLevel: getPriorityLevel(score),
    submittedBy: 'public-dashboard',
    submittedByRole: 'admin',
  };
}

router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find({ isResolved: false }).sort({ priorityScore: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const incident = await Incident.create(buildIncidentPayload(req.body));
    req.io.emit('new-incident', incident);
    res.status(201).json({
      message: 'Incident reported',
      priorityScore: incident.priorityScore,
      incident,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/resolve', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    req.io.emit('incident-resolved', { incidentId: req.params.id });
    res.json({ message: 'Incident resolved', incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
