// ELD (Electronic Logging Device) data analyzer
// In production this would ingest telematics streams.
// Here we expose aggregated analytics from stored vehicle records.

const Vehicle = require('../models/Vehicle');

exports.fleetAnalytics = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const totalDistance = vehicles.reduce((s, v) => s + (v.odometerKm || 0), 0);
    const totalFuel = vehicles.reduce((s, v) => s + (v.fuelLiters || 0), 0);
    const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

    const routeSuggestions = [
      { route: 'Lagos → Kano', currentKm: 1142, optimizedKm: 1023 },
      { route: 'Abuja → Port Harcourt', currentKm: 687, optimizedKm: 634 },
      { route: 'Ibadan → Enugu', currentKm: 492, optimizedKm: 458 },
    ].map((r) => ({
      ...r,
      savedKm: r.currentKm - r.optimizedKm,
      savedFuelLiters: Math.round(((r.currentKm - r.optimizedKm) / avgEfficiency) || 0),
    }));

    res.json({
      totalVehicles: vehicles.length,
      totalDistanceKm: totalDistance,
      totalFuelLiters: totalFuel,
      avgEfficiencyKmPerL: Number(avgEfficiency.toFixed(2)),
      co2SavedTons: Number(((totalFuel * 2.3) / 1000).toFixed(2)),
      routeSuggestions,
    });
  } catch (err) {
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