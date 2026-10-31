const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');

// Temporarily remove checkPlan so the server can start
router.get('/analytics', fleetAnalytics);
router.get('/fuel-report', vehicleFuelReport);


module.exports = router;