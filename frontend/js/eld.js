let map;

document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('eldStats');
  const routesEl = document.getElementById('routes');

  // 1. Initialize Map
  map = L.map('fleetMap', {
    scrollWheelZoom: false,
    preferCanvas: true
  }).setView([6.5244, 3.3792], 7);

  // 2. Load Tiles (Using CartoDB for better reliability)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap © CARTO'
  }).addTo(map);

  // 3. The Magic Fix for Hidden Tabs
  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
  });
  resizeObserver.observe(document.getElementById('fleetMap'));

  // 4. Fetch Stats & Vehicles
  try {
    console.log("Fetching ELD Analytics...");
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

    // Plot Vehicles
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
    console.error("❌ ELD Fetch Error:", e);
    statsEl.innerHTML = `<p class="text-red-500 text-sm col-span-4">Failed to load stats. Is the server awake?</p>`;
    routesEl.innerHTML = `<p class="text-red-500 text-sm">Failed to load routes.</p>`;
  }
});

function statCard(label, value) {
  return `
    <div class="bg-white rounded-xl shadow p-4">
      <p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">${label}</p>
      <p class="text-xl font-bold text-blue-800 mt-1">${value}</p>
    </div>`;
}