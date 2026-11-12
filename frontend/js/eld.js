let map;

document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('eldStats');
  const routesEl = document.getElementById('routes');
  const mapContainer = document.getElementById('fleetMap');

  // 1. Fetch Stats & Vehicles FIRST (before initializing the map)
  try {
    console.log("Fetching ELD Analytics...");
    const data = await Api.get('/eld/analytics');
    
    // If successful, render stats
    statsEl.innerHTML = [
      statCard('Total Distance', `${data.totalDistanceKm} km`),
      statCard('Total Fuel', `${data.totalFuelLiters} L`),
      statCard('Avg Efficiency', `${data.avgEfficiencyKmPerL} km/L`),
      statCard('CO₂ Saved', `${data.co2SavedTons} tons`),
    ].join('');

    routesEl.innerHTML = data.routeSuggestions.length > 0 ? data.routeSuggestions.map((r) => `
      <div class="flex justify-between items-center bg-blue-50 rounded-lg p-3">
        <div>
          <p class="font-medium text-slate-800">${r.route}</p>
          <p class="text-xs text-slate-500">Current: ${r.currentKm} km • Optimized: ${r.optimizedKm} km</p>
        </div>
        <span class="text-sm font-bold text-green-600">-${r.savedKm} km</span>
      </div>
    `).join('') : `<p class="text-slate-400">No trips scheduled yet.</p>`;

    // 2. Initialize Map (Only if they have access)
    map = L.map('fleetMap', {
      scrollWheelZoom: false,
      preferCanvas: true
    }).setView([6.5244, 3.3792], 7);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Fix for hidden tabs
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(document.getElementById('fleetMap'));

    // 3. Plot Vehicles
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
    
    // Check if the error is due to a Starter plan
    if (e.message.toLowerCase().includes('plan') || e.message.toLowerCase().includes('subscription') || e.message.toLowerCase().includes('upgrade')) {
      // Show Premium Lock Screen
      statsEl.innerHTML = ''; 
      routesEl.innerHTML = '';
      
      mapContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-6">
          <div class="text-5xl mb-4">🔒</div>
          <h3 class="text-xl font-bold text-slate-800 mb-2 text-center">ELD Analytics is a Premium Feature</h3>
          <p class="text-sm text-slate-500 mb-6 text-center max-w-md">Upgrade to the <strong>Professional</strong> or <strong>Enterprise</strong> plan to unlock live fleet mapping, route optimization, and fuel efficiency tracking.</p>
          <button onclick="window.location.href='#subscription'" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">Upgrade Plan Now</button>
        </div>
      `;
    } else {
      // Standard Server Error
      statsEl.innerHTML = `<p class="text-red-500 text-sm col-span-4">Failed to load stats. Please check your connection or try again.</p>`;
      routesEl.innerHTML = `<p class="text-red-500 text-sm">Failed to load routes.</p>`;
    }
  }
});

function statCard(label, value) {
  return `
    <div class="bg-white rounded-xl shadow p-4">
      <p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">${label}</p>
      <p class="text-xl font-bold text-blue-800 mt-1">${value}</p>
    </div>`;
}