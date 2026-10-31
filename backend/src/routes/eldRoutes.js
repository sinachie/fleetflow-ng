const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');
const { protect } = require('../middleware/auth');
const { checkPlan } = require('../middleware/checkPlan');

// Only Professional and Enterprise can access this
router.get('/analytics', protect, checkPlan(['professional', 'enterprise']), fleetAnalytics);

// Only Enterprise can access this
router.get('/advanced-reports', protect, checkPlan(['enterprise']), advancedReports);

router.get('/analytics', fleetAnalytics);
router.get('/fuel-report', vehicleFuelReport);

module.exports = router;