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

// Check if the functions exist before using them (optional, but prevents crashes)
if (!listVehicles) console.log('❌ listVehicles is undefined!');
if (!createVehicle) console.log('❌ createVehicle is undefined!');
if (!getVehicle) console.log('❌ getVehicle is undefined!');
if (!updateVehicle) console.log('❌ updateVehicle is undefined!');
if (!deleteVehicle) console.log('❌ deleteVehicle is undefined!');

router.route('/')
  .get(protect, listVehicles) // Line 7 (The crash is here!)
  .post(protect, authorize('admin', 'manager'), createVehicle);

router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, authorize('admin', 'manager'), updateVehicle)
  .delete(protect, authorize('admin'), deleteVehicle);

module.exports = router;