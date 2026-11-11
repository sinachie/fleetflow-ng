const Trip = require('../models/Trip');
const axios = require('axios');

// Helper function to pause execution (for rate limiting)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.createTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledDate, isRoundTrip, fuelType } = req.body;
    
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

    // 5. Extract coordinates
    const originLat = geoOrigin.data[0].lat;
    const originLon = geoOrigin.data[0].lon;
    const destLat = geoDest.data[0].lat;
    const destLon = geoDest.data[0].lon;

    // 6. Calculate Route using OSRM
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;
    const routeResponse = await axios.get(osrmUrl);

    if (!routeResponse.data || !routeResponse.data.routes || routeResponse.data.routes.length === 0) {
      return res.status(500).json({ message: 'Could not calculate a driving route between these cities.' });
    }

    // One-way distance
    const oneWayDistance = Math.round(routeResponse.data.routes[0].distance / 1000);
    
    // If Round Trip, double the distance
    const finalDistance = isRoundTrip ? oneWayDistance * 2 : oneWayDistance;
    
        // 7. Estimate Fuel based on Fuel Type
    let fuelEfficiency = 2.5; // Default: Heavy Diesel Truck
    
    if (fuelType === 'AGO_HEAVY') fuelEfficiency = 2.5; // Heavy Truck (approx 40L/100km)
    if (fuelType === 'AGO_MINI') fuelEfficiency = 12;   // Mini Truck / Van (approx 8.3L/100km)
    if (fuelType === 'PMS') fuelEfficiency = 10;        // Petrol Car / Van (approx 10L/100km)
    if (fuelType === 'CNG') fuelEfficiency = 1.5;       // CNG Trucks

    const estimatedFuel = Math.round(finalDistance / fuelEfficiency);

    // 8. Save the trip
    const trip = await Trip.create({
      owner: req.user._id,
      vehicle,
      origin,
      destination,
      distanceKm: finalDistance,
      estimatedFuelLiters: estimatedFuel,
      scheduledDate,
      isRoundTrip: isRoundTrip || false,
      fuelType: fuelType || 'AGO'
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error("OSRM/Nominatim Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ 
      message: 'Error calculating route. Please try again later.',
      details: error.message 
    });
  }
};

exports.listTrips = async (req, res) => {
  try {
    // Admin sees only their trips. Driver sees trips for their assigned vehicle.
    let query = { owner: req.user._id }; 
    
    if (req.user.role === 'driver') {
      const vehicle = await Vehicle.findOne({ driver: req.user._id });
      if (vehicle) query = { vehicle: vehicle._id };
    }
    
    const trips = await Trip.find(query).populate('vehicle', 'plateNumber model');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};