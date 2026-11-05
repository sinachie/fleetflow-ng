const Trip = require('../models/Trip');
const axios = require('axios');

exports.createTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledDate } = req.body;
    
    // 1. Geocode the cities to get Latitude/Longitude
    // (Using Nominatim, a free OpenStreetMap geocoder)
    const geoOrigin = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${origin}`);
    const geoDest = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${destination}`);

    if (!geoOrigin.data.length || !geoDest.data.length) {
      return res.status(400).json({ message: 'Could not find one of the locations.' });
    }

    const originCoords = `${geoOrigin.data[0].lon},${geoOrigin.data[0].lat}`;
    const destCoords = `${geoDest.data[0].lon},${geoDest.data[0].lat}`;

    // 2. Get actual driving distance from OSRM
    const routeResponse = await axios.get(`http://router.project-osrm.org/route/v1/driving/${originCoords};${destCoords}?overview=false`);
    
    // OSRM returns distance in meters. Convert to km.
    const distanceKm = Math.round(routeResponse.data.routes[0].distance / 1000);

    // 3. Estimate fuel (assuming 6 km/L)
    const estimatedFuel = Math.round(distanceKm / 6);

    // 4. Save the trip
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
    res.status(500).json({ message: 'Error calculating route' });
  }
};