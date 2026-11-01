const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');
const { protect } = require('../middleware/auth');
const { checkPlan } = require('../middleware/checkPlan');

// Use the checkPlan middleware
router.get('/analytics', protect, checkPlan(['professional', 'enterprise']), fleetAnalytics);
router.get('/fuel-report', protect, checkPlan(['professional', 'enterprise']), vehicleFuelReport);

module.exports = router; // Must be exactly this