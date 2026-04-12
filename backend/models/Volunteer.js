const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  age: { type: Number },
  bloodGroup: { type: String },
  experienceLevel: { type: String },
  specialization: { type: String },
  skillsDescription: { type: String },
  aadhaarNumber: { type: String },
  licenceNumber: { type: String },
  availability: { type: String },
  vehicleAvailable: { type: String },

  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  currentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Victim', default: null },

  // Location
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },

  // Stats
  tasksCompleted: { type: Number, default: 0 },
}, { timestamps: true });

volunteerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Volunteer', volunteerSchema);