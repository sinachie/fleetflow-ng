const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: { type: String, required: true },
    dueAtKm: { type: Number },
    dueAtDate: { type: Date },
    status: {
      type: String,
      enum: ['on-track', 'due-soon', 'critical', 'completed'],
      default: 'on-track',
    },
    notes: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);