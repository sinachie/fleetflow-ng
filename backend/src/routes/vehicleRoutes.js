const express = require('express');
const router = express.Router();

const {
  listVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  updateLocation,
  updateDriverStats,
  logFuel
} = require('../controllers/vehicleController');

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, listVehicles)
  .post(protect, authorize('admin', 'manager'), createVehicle);

router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, authorize('admin', 'manager'), updateVehicle)
  .delete(protect, authorize('admin'), deleteVehicle);

router.post('/update-location', protect, updateLocation);
router.put('/driver-update', protect, authorize('driver'), updateDriverStats);
router.post('/log-fuel', protect, logFuel); // The new fuel route

module.exports = router;