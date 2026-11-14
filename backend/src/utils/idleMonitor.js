const cron = require('node-cron');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User'); // Make sure this is imported
const { sendIdleAlert, sendOfflineAlert } = require('./emailSender');

cron.schedule('*/2 * * * *', async () => {
  console.log('🔍 Monitoring fleet: Checking for Idle and Offline trucks...');
  
  try {
    const now = new Date();

    // LAYER 1: IDLE DETECTION
    const idleVehicles = await Vehicle.find({ 
      idleSince: { $ne: null },
      idleAlertSent: false 
    }).populate('owner'); // We still populate owner to get their companyId

    for (const vehicle of idleVehicles) {
      const idleMinutes = (now - vehicle.idleSince) / 1000 / 60;

      if (idleMinutes >= 10 && vehicle.owner) {
        
        // FETCH ALL ADMINS & MANAGERS FOR THIS COMPANY
        const companyAdmins = await User.find({ 
          companyId: vehicle.owner.companyId,
          role: { $in: ['admin', 'manager'] }
        });

        // Send email to each of them
        for (const admin of companyAdmins) {
          await sendIdleAlert(
            admin.email,
            admin.name,
            vehicle.plateNumber,
            Math.round(idleMinutes),
            vehicle.currentLat,
            vehicle.currentLng
          );
        }

        vehicle.idleAlertSent = true;
        await vehicle.save();
      }
    }

    // LAYER 2: OFFLINE DETECTION
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const offlineVehicles = await Vehicle.find({
      lastLocationUpdate: { $lt: fiveMinutesAgo },
      offlineAlertSent: false,
      currentLat: { $ne: null },
      idleAlertSent: false
    }).populate('owner');

    for (const vehicle of offlineVehicles) {
      const offlineMinutes = Math.round((now - vehicle.lastLocationUpdate) / 1000 / 60);

      if (vehicle.owner) {
        // FETCH ALL ADMINS & MANAGERS FOR THIS COMPANY
        const companyAdmins = await User.find({ 
          companyId: vehicle.owner.companyId,
          role: { $in: ['admin', 'manager'] }
        });

        for (const admin of companyAdmins) {
          await sendOfflineAlert(
            admin.email,
            admin.name,
            vehicle.plateNumber,
            offlineMinutes
          );
        }
      }

      vehicle.offlineAlertSent = true;
      await vehicle.save();
    }

  } catch (err) {
    console.error('Monitor Error:', err);
  }
}, {
  scheduled: true,
  timezone: "Africa/Lagos"
});