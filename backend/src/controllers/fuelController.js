const Vehicle = require('../models/Vehicle');

exports.logFuel = async (req, res) => {
  try {
    const { vehicleId, liters, currentOdometer } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Calculate distance since last fill-up
    const distanceTravelled = currentOdometer - (vehicle.odometerKm || 0);
    
    // Calculate efficiency (Distance / Litres)
    // If it's the very first log, we can't calculate efficiency yet.
    let newEfficiency = vehicle.fuelEfficiency;
    if (distanceTravelled > 0 && liters > 0) {
      newEfficiency = distanceTravelled / liters;
    }

    // Update the vehicle record
    vehicle.odometerKm = currentOdometer;
    vehicle.fuelLiters = (vehicle.fuelLiters || 0) + Number(liters);
    vehicle.fuelEfficiency = Number(newEfficiency.toFixed(2));
    
    await vehicle.save();

    res.json({ message: 'Fuel logged successfully', vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};