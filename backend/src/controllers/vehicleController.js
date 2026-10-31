const Vehicle = require('../models/Vehicle');
const Subscription = require('../models/Subscription');

// 1. Create Vehicle (With Plan Limits)
exports.createVehicle = async (req, res) => {
  try {
    // Find the user's active subscription
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    
    if (!sub) {
      return res.status(403).json({ message: 'You need an active subscription to add vehicles.' });
    }

    // Count how many vehicles this specific user has added
    // Note: We are assuming the vehicle is linked to the user who created it.
    const vehicleCount = await Vehicle.countDocuments({ owner: req.user._id });

    // Enforce Limits based on the Plan
    if (sub.plan === 'starter' && vehicleCount >= 5) {
      return res.status(403).json({ message: 'Starter plan is limited to 5 vehicles. Please upgrade to Professional.' });
    }
    if (sub.plan === 'professional' && vehicleCount >= 30) {
      return res.status(403).json({ message: 'Professional plan is limited to 30 vehicles. Please upgrade to Enterprise.' });
    }

    // If they pass the limits, create the vehicle
    // We add 'owner: req.user._id' so we know who it belongs to
    const vehicle = await Vehicle.create({
      ...req.body,
      owner: req.user._id 
    });
    
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. List Vehicles
exports.listVehicles = async (req, res) => {
  try {
    // Only show vehicles owned by the logged-in user (or all if admin)
    const query = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const vehicles = await Vehicle.find(query).populate('driver', 'name email phone');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Get Single Vehicle
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Update Vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 5. Delete Vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};