const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { predictStatus, suggestNextServiceDate } = require('../utils/predictor');

exports.listMaintenance = async (req, res) => {
  try {
    const list = await Maintenance.find().populate('vehicle', 'plateNumber model odometerKm');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Predictive endpoint: returns alert list for a given vehicle
exports.predictForVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const services = ['Engine Oil', 'Brake Pads', 'Tire Rotation', 'Transmission Fluid'];
    const lastServiceKm = vehicle.odometerKm - 4000; // demo baseline; replace with real history

    const predictions = services.map((svc) => {
      const { status, remainingKm } = predictStatus(vehicle.odometerKm, lastServiceKm, svc);
      return {
        serviceType: svc,
        status,
        remainingKm,
        suggestedDate: suggestNextServiceDate(50, remainingKm),
      };
    });

    res.json({ vehicle: vehicle.plateNumber, predictions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeMaintenance = async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};