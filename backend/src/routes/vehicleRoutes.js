const express = require('express');
const router = express.Router();
const { listVehicles, createVehicle, getVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, listVehicles) // Users must be logged in to see their vehicles
  .post(protect, createVehicle); // We enforce the limit inside the controller

router.route('/:id')
  .get(protect, getVehicle)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

module.exports = router;