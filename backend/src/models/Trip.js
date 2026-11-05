const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distanceKm: { type: Number },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'scheduled' },
  scheduledDate: { type: Date },
  estimatedFuelLiters: { type: Number }
  isRoundTrip: { type: Boolean, default: false }
  fuelType: { type: String, enum: ['AGO', 'PMS', 'LPG'], default: 'AGO' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);