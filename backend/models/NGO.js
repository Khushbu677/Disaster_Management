const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ngoSchema = new mongoose.Schema({
  organizationName: { type: String, required: true, trim: true },
  registrationNumber: { type: String, required: true, unique: true },
  establishedYear: { type: Number },
  headName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  registeredAddress: { type: String, required: true },
  totalWorkers: { type: Number, default: 0 },
  trainedRescueWorkers: { type: Number, default: 0 },
  pastExperience: { type: String, default: '' },

  // Aid capabilities offered
  capabilities: [{
    type: String,
    enum: ['Food & Water','Shelter / Camps','Medical Aid','Rescue Operations','Clothing & Essentials','Financial Aid','Communication','Mental Health']
  }],
  capacityDetails: { type: String, default: '' },
  deploymentTimeline: { type: String, default: 'Immediately' },

  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ngoSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('NGO', ngoSchema);