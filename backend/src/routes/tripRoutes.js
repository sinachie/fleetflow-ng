const express = require('express');
const router = express.Router();
const { createTrip, listTrips } = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.get('/', protect, listTrips);
router.post('/', protect, createTrip);

module.exports = router;