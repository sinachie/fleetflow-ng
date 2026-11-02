const cron = require('node-cron');
const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const { sendMaintenanceAlert } = require('./emailSender');

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🤖 Running daily predictive maintenance check...');
  try {
    const maintenances = await Maintenance.find({ status: { $ne: 'completed' } }).populate('vehicle').populate('owner');

    for (let m of maintenances) {
      if (!m.vehicle) continue;
      
      const remainingKm = m.dueAtKm - m.vehicle.odometerKm;
      
      // If the vehicle is within 500km of needing service, send an alert
      if (remainingKm <= 500 && remainingKm > 0 && m.owner) {
        await sendMaintenanceAlert(m.owner.email, m.vehicle.plateNumber, m.serviceType, remainingKm);
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});