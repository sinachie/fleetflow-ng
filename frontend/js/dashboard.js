document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('stats');
  const predEl = document.getElementById('predictions');

  try {
    const vehicles = await Api.get('/vehicles').catch(() => []);
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === 'active').length;
    const critical = vehicles.filter((v) => v.status === 'critical').length;
    const avgEff =
      vehicles.length > 0
        ? (vehicles.reduce((s, v) => s + (v.fuelEfficiency || 0), 0) / vehicles.length).toFixed(1)
        : '0.0';

    statsEl.innerHTML = [
      statCard('Total Vehicles', total, 'text-blue-800'),
      statCard('Active Trips', active, 'text-green-600'),
      statCard('Critical', critical, 'text-red-600'),
      statCard('Avg Efficiency', `${avgEff} km/L`, 'text-blue-800'),
    ].join('');

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