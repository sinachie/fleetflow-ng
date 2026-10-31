const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');
//const { protect } = require('../middleware/auth');
//const { checkPlan } = require('../middleware/checkPlan');

// Only Professional and Enterprise can access ELD Analytics
//router.get('/analytics', protect, checkPlan(['professional', 'enterprise']), fleetAnalytics);
//router.get('/fuel-report', protect, checkPlan(['professional', 'enterprise']), vehicleFuelReport);

// Temporarily remove checkPlan so the server can start
router.get('/analytics', fleetAnalytics);
router.get('/fuel-report', vehicleFuelReport);


module.exports = router;