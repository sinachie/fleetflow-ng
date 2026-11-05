const Trip = require('../models/Trip');
const axios = require('axios');

// 1. Create a Trip
const createTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledDate } = req.body;
    
    const geoOrigin = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${origin},Nigeria`);
    const geoDest = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${destination},Nigeria`);

    if (!geoOrigin.data.length || !geoDest.data.length) {
      return res.status(400).json({ message: 'Could not find one of the locations in Nigeria.' });
    }

    const originCoords = `${geoOrigin.data[0].lon},${geoOrigin.data[0].lat}`;
    const destCoords = `${geoDest.data[0].lon},${geoDest.data[0].lat}`;

    const routeResponse = await axios.get(`http://router.project-osrm.org/route/v1/driving/${originCoords};${destCoords}?overview=false`);
    const distanceKm = Math.round(routeResponse.data.routes[0].distance / 1000);
    const estimatedFuel = Math.round(distanceKm / 6);

    const trip = await Trip.create({
      vehicle,
      origin,
      destination,
      distanceKm,
      estimatedFuelLiters: estimatedFuel,
      scheduledDate
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error calculating route. Please try again.' });
  }
};

// 2. List Trips
const listTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate('vehicle', 'plateNumber model');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export both functions together
module.exports = { createTrip, listTrips };