// Simple rule-based predictive maintenance engine
// Extended later with ML; this is production-safe rule logic.

const SERVICE_INTERVALS = {
  'Engine Oil': 10000,
  'Brake Pads': 25000,
  'Tire Rotation': 15000,
  'Transmission Fluid': 40000,
  'Air Filter': 20000,
  'Coolant Flush': 50000,
};

function predictStatus(currentKm, lastServiceKm, serviceType) {
  const interval = SERVICE_INTERVALS[serviceType] || 15000;
  const remaining = interval - (currentKm - lastServiceKm);

  if (remaining <= 0) return { status: 'critical', remainingKm: remaining };
  if (remaining <= 2000) return { status: 'due-soon', remainingKm: remaining };
  return { status: 'on-track', remainingKm: remaining };
}

function suggestNextServiceDate(avgKmPerDay, remainingKm) {
  if (!avgKmPerDay || avgKmPerDay <= 0) return null;
  const days = Math.floor(remainingKm / avgKmPerDay);
  const d = new Date();
  d.setDate(d.getDate() + Math.max(days, 0));
  return d;
}

module.exports = { predictStatus, suggestNextServiceDate, SERVICE_INTERVALS };