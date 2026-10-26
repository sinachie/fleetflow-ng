document.addEventListener('DOMContentLoaded', async () => {
  const statsEl = document.getElementById('eldStats');
  const routesEl = document.getElementById('routes');
  try {
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
  } catch (e) {
    statsEl.innerHTML = `<p class="text-red-500 text-sm col-span-4">${e.message}</p>`;
    routesEl.innerHTML = `<p class="text-red-500 text-sm">${e.message}</p>`;
  }
});

function statCard(label, value) {
  return `
    <div class="bg-white rounded-xl shadow p-4">
      <p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">${label}</p>
      <p class="text-xl font-bold text-blue-800 mt-1">${value}</p>
    </div>`;
}