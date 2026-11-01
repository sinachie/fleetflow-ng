const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');
const { protect } = require('../middleware/auth');

// Temporarily public so the dashboard can load
router.get('/analytics', fleetAnalytics);
router.get('/fuel-report', vehicleFuelReport);

module.exports = router;