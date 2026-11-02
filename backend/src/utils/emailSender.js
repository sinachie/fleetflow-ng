const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Add this to .env
    pass: process.env.EMAIL_PASS  // Add this to .env (App Password)
  }
});

exports.sendMaintenanceAlert = async (email, vehiclePlate, serviceType, remainingKm) => {
  try {
    await transporter.sendMail({
      from: '"FleetFlow NG" <alerts@fleetflow.com.ng>',
      to: email,
      subject: `⚠️ Maintenance Alert: ${vehiclePlate}`,
      html: `
        <h2>Predictive Maintenance Alert</h2>
        <p>Your vehicle <strong>${vehiclePlate}</strong> is due for <strong>${serviceType}</strong> in <strong>${remainingKm} km</strong>.</p>
        <p>Please log in to your dashboard to schedule a service.</p>
      `
    });
    console.log('✅ Email sent to', email);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
};