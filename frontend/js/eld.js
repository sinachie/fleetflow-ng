let map; 

document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('eldStats');
  const routesEl = document.getElementById('routes');

  // 1. Initialize Map with explicit size checks
  map = L.map('fleetMap', { 
    scrollWheelZoom: false,
    preferCanvas: true 
  }).setView([6.5244, 3.3792], 7); 

  // 2. Force render after tab is visible
  setTimeout(() => {
    map.invalidateSize();
  }, 400); 

  // 3. Load Tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map); 
  

  try {
    // 4. Load Stats
    const data = await Api.get('/eld/analytics');
    statsEl.innerHTML = [
      statCard('Total Distance', `${data.totalDistanceKm} km`),
      statCard('Total Fuel', `${data.totalFuelLiters} L`),
      statCard('Avg Efficiency', `${data.avgEfficiencyKmPerL} km/L`),
      statCard('CO₂ Saved', `${data.co2SavedTons} tons`),
    ].join('');

    routesEl.innerHTML = data.routeSuggestions.map((r) => `
      <div class="flex justify-between items-center bg-blue-50 rounded-lg p-3">
        <div>
          <p class="font-medium text-slate-800">${r.route}</p>
          <p class="text-xs text-slate-500">Current: ${r.currentKm} km • Optimized: ${r.optimizedKm} km</p>
        </div>
        <span class="text-sm font-bold text-green-600">-${r.savedKm} km</span>
      </div>
    `).join('');

    // 5. Plot Vehicles
    const vehicles = await Api.get('/vehicles');
    vehicles.forEach(v => {
      if (v.currentLat && v.currentLng) {
        const marker = L.marker([v.currentLat, v.currentLng]).addTo(map);
        marker.bindPopup(`
          <div class="text-sm">
            <strong>${v.plateNumber}</strong><br/>
            Model: ${v.model}<br/>
            Status: ${v.status}
          </div>
        `);
      }
    });

  } catch (e) {
    statsEl.innerHTML = `<p class="text-red-500 text-sm col-span-4">${e.message}</p>`;
  }
});

function statCard(label, value) {
  return `
    <div class="bg-white rounded-xl shadow p-4">
      <p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">${label}</p>
      <p class="text-xl font-bold text-blue-800 mt-1">${value}</p>
    </div>`;
}