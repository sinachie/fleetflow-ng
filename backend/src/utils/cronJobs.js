const cron = require('node-cron');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User'); // Make sure this is imported
const { sendMaintenanceAlert } = require('./emailSender');

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('🤖 Running daily predictive maintenance check...');
  
  try {
    // 1. Find all maintenance tasks that are NOT completed
    const tasks = await Maintenance.find({ status: { $ne: 'completed' } })
      .populate('vehicle')
      .populate('owner'); 

    for (const task of tasks) {
      // Skip if the task doesn't have a vehicle linked
      if (!task.vehicle || !task.owner) continue;

      // 2. Calculate remaining KM
      const remainingKm = task.dueAtKm - (task.vehicle.odometerKm || 0);

      // 3. If remaining KM is less than 500 (and hasn't passed 0 yet), send email
      if (remainingKm <= 500 && remainingKm > 0) {
        
        // FETCH ALL ADMINS & MANAGERS FOR THIS COMPANY
        const companyAdmins = await User.find({ 
          companyId: task.owner.companyId,
          role: { $in: ['admin', 'manager'] }
        });

        // Send the alert to everyone who needs to see it
        for (const admin of companyAdmins) {
          await sendMaintenanceAlert(
            admin.email,
            task.vehicle.plateNumber,
            task.serviceType,
            remainingKm
          );
        }
      }
    }
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
}, {
  scheduled: true,
  timezone: "Africa/Lagos"
});