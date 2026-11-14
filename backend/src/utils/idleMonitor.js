const cron = require('node-cron');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { sendIdleAlert, sendOfflineAlert } = require('./emailSender');

// Run every 2 minutes
cron.schedule('*/2 * * * *', async () => {
  console.log('🔍 Monitoring fleet: Checking for Idle and Offline trucks...');
  
  try {
    const now = new Date();

    // ==========================================
    // LAYER 1: IDLE DETECTION (Stopped > 10 mins)
    // ==========================================
    const idleVehicles = await Vehicle.find({ 
      idleSince: { $ne: null },
      idleAlertSent: false 
    }).populate('owner');

    for (const vehicle of idleVehicles) {
      const idleMinutes = (now - vehicle.idleSince) / 1000 / 60;

      if (idleMinutes >= 10) {
        if (vehicle.owner && vehicle.owner.email) {
          await sendIdleAlert(
            vehicle.owner.email,
            vehicle.owner.name,
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

    // ==========================================
    // LAYER 2: OFFLINE DETECTION (No ping > 5 mins)
    // ==========================================
    // Calculate the time 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const offlineVehicles = await Vehicle.find({
      lastLocationUpdate: { $lt: fiveMinutesAgo }, // Last ping was over 5 mins ago
      offlineAlertSent: false,                     // We haven't alerted yet
      currentLat: { $ne: null },                   // They were tracking at some point
      idleAlertSent: false                         // Don't double-alert if they are just idle
    }).populate('owner');

    for (const vehicle of offlineVehicles) {
      const offlineMinutes = Math.round((now - vehicle.lastLocationUpdate) / 1000 / 60);

      if (vehicle.owner && vehicle.owner.email) {
        console.log(`🚨 OFFLINE ALERT: ${vehicle.plateNumber} silent for ${offlineMinutes} mins.`);
        await sendOfflineAlert(
          vehicle.owner.email,
          vehicle.owner.name,
          vehicle.plateNumber,
          offlineMinutes
        );
      }

      // Mark as alerted so we don't spam them every 2 minutes
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