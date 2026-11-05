const Trip = require('../models/Trip');
const axios = require('axios');

// Helper function to pause execution (for rate limiting)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.createTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledDate } = req.body;
    
    // 1. Custom headers to comply with Nominatim's strict usage policy
    const headers = {
      'User-Agent': 'FleetFlowNG/1.0 (contact@fleetflow.com.ng)'
    };

    // 2. Geocode Origin
    const geoOrigin = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${origin},Nigeria&format=jsonv2&limit=1`,
      { headers }
    );

    if (!geoOrigin.data || geoOrigin.data.length === 0) {
      return res.status(400).json({ message: `Could not find location: ${origin}. Please check the spelling.` });
    }

    // 3. Wait 1.1 seconds to respect Nominatim's 1 request/second rate limit
    await delay(1100); 

    // 4. Geocode Destination
    const geoDest = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${destination},Nigeria&format=jsonv2&limit=1`,
      { headers }
    );

    if (!geoDest.data || geoDest.data.length === 0) {
      return res.status(400).json({ message: `Could not find location: ${destination}. Please check the spelling.` });
    }

    // 5. Extract coordinates (Nominatim returns latitude & longitude)
    const originLat = geoOrigin.data[0].lat;
    const originLon = geoOrigin.data[0].lon;
    const destLat = geoDest.data[0].lat;
    const destLon = geoDest.data[0].lon;

    // 6. Calculate Route using OSRM (Note: OSRM requires Lon,Lat format)
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;
    const routeResponse = await axios.get(osrmUrl);

    if (!routeResponse.data || !routeResponse.data.routes || routeResponse.data.routes.length === 0) {
      return res.status(500).json({ message: 'Could not calculate a driving route between these cities.' });
    }

    // One-way distance
    const oneWayDistance = Math.round(routeResponse.data.routes[0].distance / 1000);
    
    // Read the checkbox from the frontend
    const { isRoundTrip } = req.body; 
    
    // If Round Trip, double the distance
    const finalDistance = isRoundTrip ? oneWayDistance * 2 : oneWayDistance;
    
    // 7. Estimate Fuel (Assuming 6 km/L average)
    const estimatedFuel = Math.round(finalDistance / 6);

    // 8. Save the trip
    const trip = await Trip.create({
      vehicle,
      origin,
      destination,
      distanceKm: finalDistance,
      estimatedFuelLiters: estimatedFuel,
      scheduledDate,
      isRoundTrip: isRoundTrip || false
    });

    res.status(201).json(trip);
  } catch (error) {
    // Log the EXACT error to Render so we can debug it if it fails again
    console.error("OSRM/Nominatim Error:", error.response ? error.response.data : error.message);
    
    res.status(500).json({ 
      message: 'Error calculating route. Please try again later.',
      details: error.message 
    });
  }
};

// ... (Keep your listTrips function below) ...
exports.listTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate('vehicle', 'plateNumber model');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};