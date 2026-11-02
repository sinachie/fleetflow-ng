const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');
const { protect } = require('../middleware/auth');
const { checkPlan } = require('../middleware/checkplan');

// 1. Fleet Analytics (Only logged-in users with Professional or Enterprise plans)
router.get('/analytics', protect, checkPlan(['professional', 'enterprise']), fleetAnalytics);

// 2. Fuel Report (Only logged-in users with Professional or Enterprise plans)
router.get('/fuel-report', protect, checkPlan(['professional', 'enterprise']), vehicleFuelReport);

module.exports = router;