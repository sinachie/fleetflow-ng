const express = require('express');
const router = express.Router();
const {
  listMaintenance,
  createMaintenance,
  predictForVehicle,
  completeMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');

router.get('/', protect, listMaintenance);
router.post('/', protect, createMaintenance);
router.get('/predict/:vehicleId', protect, predictForVehicle);
router.put('/:id/complete', protect, completeMaintenance);

module.exports = router;