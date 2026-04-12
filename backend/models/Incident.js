const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Flood','Earthquake','Fire','Landslide','Storm','Cyclone','Tsunami','Other']
  },
  location: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 10 },
  peopleAffected: { type: Number, required: true, default: 1 },
  urgency: { type: Number, required: true, enum: [1, 2, 3] }, // 1=moderate, 2=high, 3=immediate
  description: { type: String, default: '' },

  // Computed score
  priorityScore: { type: Number, default: 0 },
  priorityLevel: { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW'], default: 'LOW' },

  // Geolocation
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },

  // Who submitted
  submittedBy: { type: String, default: 'system' }, // role: volunteer/admin/ngo
  submittedByRole: { type: String, enum: ['volunteer','ngo','admin'], default: 'admin' },

  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

// Calculate priority score before saving
incidentSchema.pre('save', function (next) {
  const ageMinutes = this.createdAt
    ? (Date.now() - new Date(this.createdAt).getTime()) / 60000
    : 0;
  const decay = Math.max(0.5, 1 - ageMinutes * 0.01);
  this.priorityScore = Math.round(
    (this.severity * 10 + this.peopleAffected / 500 + this.urgency * 15) * decay
  );
  if (this.priorityScore >= 130) this.priorityLevel = 'CRITICAL';
  else if (this.priorityScore >= 80) this.priorityLevel = 'HIGH';
  else if (this.priorityScore >= 40) this.priorityLevel = 'MEDIUM';
  else this.priorityLevel = 'LOW';
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);