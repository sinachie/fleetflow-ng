const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // <-- ADD THIS
  plateNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['active', 'idle', 'maintenance', 'critical'],
    default: 'idle',
  },
  lastServiceDate: { type: Date },
  nextServiceDate: { type: Date },
  odometerKm: { type: Number, default: 0 },
  fuelLiters: { type: Number, default: 0 },
  fuelEfficiency: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);