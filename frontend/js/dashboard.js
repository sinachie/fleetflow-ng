document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('stats');
  const predEl = document.getElementById('predictions');

  try {
    // 1. Fetch Vehicles and Trips simultaneously for speed
    const [vehicles, trips] = await Promise.all([
      Api.get('/vehicles'),
      Api.get('/trips').catch(() => []) // Fallback to empty array if trips fail
    ]);

    const totalVehicles = vehicles.length;
    const criticalVehicles = vehicles.filter(v => v.status === 'critical').length;
    
    // Count active trips (scheduled or in-progress)
    const activeTrips = trips.filter(t => t.status === 'scheduled' || t.status === 'in-progress').length;

    // Calculate Avg Efficiency (Only count vehicles that have > 0 efficiency)
    const vehiclesWithEfficiency = vehicles.filter(v => v.fuelEfficiency > 0);
    let avgEff = 0.0;
    if (vehiclesWithEfficiency.length > 0) {
      const totalEff = vehiclesWithEfficiency.reduce((sum, v) => sum + v.fuelEfficiency, 0);
      avgEff = (totalEff / vehiclesWithEfficiency.length).toFixed(1);
    }

    // 2. Render Stats
    statsEl.innerHTML = [
      statCard('Total Vehicles', totalVehicles, 'text-blue-800'),
      statCard('Active Trips', activeTrips, 'text-green-600'),
      statCard('Critical', criticalVehicles, 'text-red-600'),
      statCard('Avg Efficiency', `${avgEff} km/L`, 'text-blue-800'),
    ].join('');

    // 3. Render Predictive Maintenance Alerts (Top 5)
    predEl.innerHTML = vehicles.slice(0, 5).map((v) => `
      <div class="flex justify-between items-center border-b py-2">
        <div>
          <p class="font-medium text-slate-800">${v.plateNumber} • ${v.model}</p>
          <p class="text-xs text-slate-500">Odometer: ${v.odometerKm || 0} km</p>
        </div>
        <span class="text-xs px-2 py-1 rounded ${
          v.status === 'critical' ? 'bg-red-100 text-red-700' :
          v.status === 'maintenance' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }">${v.status || 'idle'}</span>
      </div>
    `).join('') || '<p class="text-slate-400">No vehicles yet.</p>';

  } catch (e) {
    statsEl.innerHTML = `<p class="text-red-500 text-sm col-span-4">${e.message}</p>`;
  }
});

function statCard(label, value, colorClass) {
  return `
    <div class="bg-white rounded-xl shadow p-4">
      <p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">${label}</p>
      <p class="text-2xl font-bold ${colorClass} mt-1">${value}</p>
    </div>`;
}