const Vehicle = require('../models/Vehicle');
const Subscription = require('../models/Subscription');

exports.createVehicle = async (req, res) => {
  try {
    // 1. Check if the user has an active subscription
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!sub) {
      return res.status(403).json({ message: 'You need an active subscription to add vehicles.' });
    }

    // 2. Count how many vehicles this specific user has added
    const vehicleCount = await Vehicle.countDocuments({ owner: req.user._id });

    // 3. Enforce Plan Limits
    if (sub.plan === 'starter' && vehicleCount >= 5) {
      return res.status(403).json({ message: 'Starter plan limited to 5 vehicles. Please upgrade to Professional.' });
    }
    if (sub.plan === 'professional' && vehicleCount >= 30) {
      return res.status(403).json({ message: 'Professional plan limited to 30 vehicles. Please upgrade to Enterprise.' });
    }

    // 4. Create the vehicle and link it to the user
    const vehicle = await Vehicle.create({
      ...req.body,
      owner: req.user._id 
    });
    
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};