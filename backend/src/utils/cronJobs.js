const cron = require('node-cron');
const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const { sendMaintenanceAlert } = require('./emailSender');

// Runs every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🤖 Running daily predictive maintenance check...');
  
  try {
    // Find all tasks that are NOT completed and have a populated vehicle and owner
    const tasks = await Maintenance.find({ status: { $ne: 'completed' } })
      .populate('vehicle')
      .populate('owner'); 

    for (const task of tasks) {
      if (!task.vehicle || !task.owner) continue;

      // Calculate remaining KM
      const remainingKm = task.dueAtKm - (task.vehicle.odometerKm || 0);

      // If the truck is within 500km of needing service, send the alert
      if (remainingKm <= 500 && remainingKm > 0) {
        await sendMaintenanceAlert(
          task.owner.email,
          task.vehicle.plateNumber,
          task.serviceType,
          remainingKm,
          task.owner.name
        );
      }
    }
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
}, {
  scheduled: true,
  timezone: "Africa/Lagos"
});