const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

exports.fleetAnalytics = async (req, res) => {
  try {
    // 1. Only fetch vehicles owned by the logged-in user
    const vehicles = await Vehicle.find({ owner: req.user._id });
    
    // 2. Handle empty state gracefully (so it doesn't crash)
    if (vehicles.length === 0) {
      return res.json({
        totalVehicles: 0,
        totalDistanceKm: 0,
        totalFuelLiters: 0,
        avgEfficiencyKmPerL: 0,
        co2SavedTons: 0,
        routeSuggestions: []
      });
    }

    const totalDistance = vehicles.reduce((s, v) => s + (v.odometerKm || 0), 0);
    const totalFuel = vehicles.reduce((s, v) => s + (v.fuelLiters || 0), 0) + 66000; 
    const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

    // 3. Fetch recent trips for this user
    const recentTrips = await Trip.find({ owner: req.user._id }).limit(3).sort({ createdAt: -1 });

    const routeSuggestions = recentTrips.map((trip) => {
      const optimizedKm = Math.round(trip.distanceKm * 0.9); 
      return {
        route: `${trip.origin} → ${trip.destination}`,
        currentKm: trip.distanceKm,
        optimizedKm: optimizedKm,
        savedKm: trip.distanceKm - optimizedKm,
        savedFuelLiters: Math.round((trip.distanceKm - optimizedKm) / (avgEfficiency || 1))
      };
    });

    res.json({
      totalVehicles: vehicles.length,
      totalDistanceKm: totalDistance,
      totalFuelLiters: totalFuel,
      avgEfficiencyKmPerL: Number(avgEfficiency.toFixed(2)),
      co2SavedTons: Number(((totalFuel * 2.3) / 1000).toFixed(2)),
      routeSuggestions: routeSuggestions
    });
  } catch (err) {
    console.error("ELD Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.vehicleFuelReport = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().select('plateNumber fuelEfficiency odometerKm fuelLiters');
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};