const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const victimSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  age: { type: Number },
  bloodGroup: { type: String },
  aadhaarNumber: { type: String },
  address: { type: String },
  disasterType: { type: String, required: true, enum: ['Flood','Earthquake','Cyclone / Storm','Fire','Landslide','Industrial Accident','Building Collapse','Other'] },
  injuryLevel: { type: String, required: true, enum: ['Critical - Immediate help needed','Moderate - Injured but stable','Moderate — Medical attention needed','Minor - Mostly safe','None - Stranded only','None — Stranded only'] },
  numberOfPeople: { type: Number, default: 1 },
  hasChildrenOrElderly: { type: String, default: 'No' },
  additionalInfo: { type: String, default: '' },

  // Priority scoring
  priorityScore: { type: Number, default: 0 },
  priorityLevel: { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW'], default: 'LOW' },

  // Status tracking
  status: {
    type: String,
    enum: ['pending','reviewing','assigned','dispatched','resolved'],
    default: 'pending'
  },
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', default: null },
  ticketId: { type: String, unique: true },

  // Geolocation
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
}, { timestamps: true });

// Auto-generate ticket ID
victimSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    this.ticketId = 'DR-' + Date.now().toString().slice(-6);
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Victim', victimSchema);