const express = require('express');
const router = express.Router();

const {
  listVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

const { protect, authorize } = require('../middleware/auth');

// Route: /api/vehicles/
router.route('/')
  .get(protect, listVehicles)
  .post(protect, authorize('admin', 'manager'), createVehicle);

// Route: /api/vehicles/:id
router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, authorize('admin', 'manager'), updateVehicle)
  .delete(protect, authorize('admin'), deleteVehicle);

module.exports = router;