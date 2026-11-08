const Vehicle = require('../models/Vehicle');
const Subscription = require('../models/Subscription');

exports.createVehicle = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!sub) return res.status(403).json({ message: 'You need an active subscription.' });

    const vehicleCount = await Vehicle.countDocuments({ owner: req.user._id });
    if (sub.plan === 'starter' && vehicleCount >= 5) return res.status(403).json({ message: 'Starter plan limited to 5 vehicles.' });
    if (sub.plan === 'professional' && vehicleCount >= 30) return res.status(403).json({ message: 'Professional plan limited to 30 vehicles.' });

    const vehicle = await Vehicle.create({ ...req.body, owner: req.user._id });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listVehicles = async (req, res) => {
  try {
    let query = req.user.role === 'admin' || req.user.role === 'manager' ? { owner: req.user._id } : { driver: req.user._id };
    const vehicles = await Vehicle.find(query).populate('driver', 'name email phone');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await Vehicle.findOneAndUpdate(
      { plateNumber: req.body.plateNumber, owner: req.user._id },
      { currentLat: lat, currentLng: lng }
    );
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDriverStats = async (req, res) => {
  try {
    const { odometerKm, fuelLiters } = req.body;
    const vehicle = await Vehicle.findOneAndUpdate(
      { driver: req.user._id },
      { odometerKm, fuelLiters },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'No vehicle assigned to you.' });
    res.json({ message: 'Stats updated successfully', vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// THE BACKEND LOGIC FOR FUEL
exports.logFuel = async (req, res) => {
  try {
    const { vehicleId, liters, currentOdometer } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const distanceTravelled = currentOdometer - (vehicle.odometerKm || 0);
    let newEfficiency = vehicle.fuelEfficiency;
    if (distanceTravelled > 0 && liters > 0) {
      newEfficiency = distanceTravelled / liters;
    }

    vehicle.odometerKm = currentOdometer;
    vehicle.fuelLiters = (vehicle.fuelLiters || 0) + Number(liters);
    vehicle.fuelEfficiency = Number(newEfficiency.toFixed(2));
    await vehicle.save();

    res.json({ message: 'Fuel logged successfully', vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};