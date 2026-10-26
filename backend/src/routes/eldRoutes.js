const express = require('express');
const router = express.Router();
const { fleetAnalytics, vehicleFuelReport } = require('../controllers/eldController');
const { protect } = require('../middleware/auth');

router.get('/analytics', protect, fleetAnalytics);
router.get('/fuel-report', protect, vehicleFuelReport);

module.exports = router;