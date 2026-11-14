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
    let query = {};
    
    // Admins and Managers only see vehicles they own
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      query = { owner: req.user._id };
    } 
    // Drivers only see the vehicle assigned to them
    else if (req.user.role === 'driver') {
      query = { driver: req.user._id };
    }

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
    const { lat, lng, plateNumber } = req.body;
    
    // Find the vehicle
    const vehicle = await Vehicle.findOne({ plateNumber, owner: req.user.owner || req.user._id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const now = new Date();
    
    // Check if the vehicle has moved significantly (approx 50 meters)
    // Simple distance calculation
    let hasMoved = true;
    if (vehicle.currentLat && vehicle.currentLng) {
      const latDiff = Math.abs(vehicle.currentLat - lat);
      const lngDiff = Math.abs(vehicle.currentLng - lng);
      // 0.0005 degrees is roughly 50 meters
      if (latDiff < 0.0005 && lngDiff < 0.0005) {
        hasMoved = false; 
      }
    }

    if (hasMoved) {
      // They moved, reset the idle timer
      vehicle.idleSince = now;
      vehicle.idleAlertSent = false;
    } else {
      // They haven't moved. Check if this is the first time we noticed.
      if (!vehicle.idleSince) vehicle.idleSince = now;
    }

    vehicle.currentLat = lat;
    vehicle.currentLng = lng;
    vehicle.lastLocationUpdate = now;
    await vehicle.save();

    res.json({ message: 'Location updated', vehicle });
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