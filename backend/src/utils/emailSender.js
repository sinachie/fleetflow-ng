const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // fleetflowng@gmail.com
    pass: process.env.EMAIL_PASS  // Your 16-character Google App Password
  }
});

exports.sendMaintenanceAlert = async (email, vehiclePlate, serviceType, remainingKm) => {
  try {
    await transporter.sendMail({
      // 🚨 CRITICAL FIX: The 'from' address MUST match your authenticated Gmail user
      from: `"FleetFlow NG Support" <${process.env.EMAIL_USER}>`, 
      to: email, // This is the fleet manager's email (e.g., ifesinachi@...)
      subject: `⚠️ Maintenance Alert: ${vehiclePlate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1e3a8a; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">FleetFlow NG</h2>
          </div>
          <div style="padding: 20px; color: #334155;">
            <h3 style="color: #0f172a;">Predictive Maintenance Alert</h3>
            <p>Your vehicle <strong>${vehiclePlate}</strong> is due for <strong>${serviceType}</strong> in <strong>${remainingKm} km</strong>.</p>
            <p>Please log in to your dashboard to schedule a service and prevent a breakdown.</p>
            <a href="https://fleetflow.com.ng" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            Need help? Reply to this email or contact <a href="mailto:fleetflowng@gmail.com" style="color: #2563eb;">fleetflowng@gmail.com</a>
          </div>
        </div>
      `
    });
    console.log('✅ Email sent to', email);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
};

exports.sendIdleAlert = async (email, ownerName, vehiclePlate, idleMinutes, lat, lng) => {
  try {
    // Generate a Google Maps link for the admin to click
    const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

    await transporter.sendMail({
      from: `"FleetFlow NG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 IDLE ALERT: ${vehiclePlate} stopped for ${idleMinutes} mins`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">Unauthorized Stop Detected</h2>
          </div>
          <div style="padding: 20px; color: #334155;">
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>Your vehicle <strong>${vehiclePlate}</strong> has been stationary for <strong>${idleMinutes} minutes</strong>.</p>
            <p>This could indicate a breakdown, traffic, or unauthorized fuel siphoning.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Current Location:</p>
              <a href="${mapLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">📍 View on Google Maps</a>
            </div>
            
            <p>Please contact the driver immediately.</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Idle alert email sent to ${email}`);
  } catch (error) {
    console.error('❌ Idle alert email failed:', error);
  }
};

exports.sendOfflineAlert = async (email, ownerName, vehiclePlate, lastSeenMinutes) => {
  try {
    await transporter.sendMail({
      from: `"FleetFlow NG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⚠️ OFFLINE ALERT: ${vehiclePlate} tracking lost`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f59e0b; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">Tracking Connection Lost</h2>
          </div>
          <div style="padding: 20px; color: #334155;">
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>Your vehicle <strong>${vehiclePlate}</strong> has stopped sending GPS signals for over <strong>${lastSeenMinutes} minutes</strong>.</p>
            <p>This usually means the driver has closed the Driver Portal app, locked their phone, or lost network connection. Please verify their status.</p>
            
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Action Required:</p>
              <p style="margin: 5px 0 0 0;">Call the driver immediately to ensure they are safe and the app is reopened.</p>
            </div>
          </div>
        </div>
      `
    });
    console.log(`✅ Offline alert email sent to ${email}`);
  } catch (error) {
    console.error('❌ Offline alert email failed:', error);
  }
};