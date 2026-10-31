const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');

// We will temporarily comment out 'protect' and 'checkPlan' so the dashboard can load data.
// Once your users are fully logging in, you can uncomment them.
// const { protect } = require('../middleware/auth');
// const { checkPlan } = require('../middleware/checkPlan');

// 1. Load analytics for the dashboard (Temporarily Public)
router.get('/analytics', fleetAnalytics);

// 2. Load fuel report (Temporarily Public)
router.get('/fuel-report', vehicleFuelReport);

// 3. Advanced Reports (Enterprise only) - We will build this function later
// router.get('/advanced-reports', protect, checkPlan(['enterprise']), advancedReports);

module.exports = router;