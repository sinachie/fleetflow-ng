const Vehicle = require('../models/Vehicle');
const Subscription = require('../models/Subscription');

// 1. Create Vehicle
exports.createVehicle = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!sub) {
      return res.status(403).json({ message: 'You need an active subscription to add vehicles.' });
    }

    const vehicleCount = await Vehicle.countDocuments({ owner: req.user._id });

    if (sub.plan === 'starter' && vehicleCount >= 5) {
      return res.status(403).json({ message: 'Starter plan limited to 5 vehicles. Please upgrade.' });
    }
    if (sub.plan === 'professional' && vehicleCount >= 30) {
      return res.status(403).json({ message: 'Professional plan limited to 30 vehicles. Please upgrade.' });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      owner: req.user._id 
    });

        // ERP Integration Trigger
    if (req.user.erpWebhookUrl) {
      try {
        await fetch(req.user.erpWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'vehicle_created', data: vehicle })
        });
        console.log('✅ ERP Webhook triggered');
      } catch (error) {
        console.error('❌ ERP Webhook failed:', error.message);
      }
    }
    
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. List Vehicles
exports.listVehicles = async (req, res) => {
  try {
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