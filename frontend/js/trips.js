document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('tripForm');
  const vehicleSelect = document.getElementById('t-vehicle');
  const resultsDiv = document.getElementById('tripResults');
  const tripsList = document.getElementById('tripsList');

  // 1. Load vehicles into the dropdown
  async function loadVehicles() {
    try {
      const vehicles = await Api.get('/vehicles');
      if (vehicles.length === 0) {
        vehicleSelect.innerHTML = `<option value="">Add a vehicle first</option>`;
      } else {
        vehicleSelect.innerHTML = vehicles.map(v => 
          `<option value="${v._id}">${v.plateNumber} - ${v.model}</option>`
        ).join('');
      }
    } catch (e) { 
      vehicleSelect.innerHTML = `<option value="">Error loading (Server asleep). Refresh page.</option>`;
      console.log(e); 
    }
  }

  // 2. Load previous trips
  async function loadTrips() {
    try {
      const trips = await Api.get('/trips');
      if (trips.length === 0) {
        tripsList.innerHTML = `<p class="text-slate-400">No trips scheduled yet.</p>`;
      } else {
        tripsList.innerHTML = trips.map(t => `
          <div class="flex justify-between items-center bg-slate-50 border p-3 rounded-lg">
            <div>
              <p class="font-bold text-slate-800">${t.origin} ➔ ${t.destination}</p>
              <p class="text-xs text-slate-500">Truck: ${t.vehicle ? t.vehicle.plateNumber : 'Unknown'} • Date: ${new Date(t.scheduledDate).toDateString()}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-blue-700">${t.distanceKm} km</p>
              <p class="text-xs text-amber-600">~${t.estimatedFuelLiters} L Fuel</p>
            </div>
          </div>
        `).join('');
      }
    } catch (e) { 
      // Changed this from vehicleSelect to tripsList so the right section updates
      tripsList.innerHTML = `<p class="text-red-500 text-sm">Error loading trips. Is the server awake?</p>`;
      console.log(e); 
    }
  }

  // 3. Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveTripBtn');
    btn.innerText = 'Calculating Route...';
    btn.disabled = true;
    resultsDiv.innerHTML = `<p class="text-blue-500 animate-pulse text-center">Pinging OSRM Servers...</p>`;

    try {
      const data = {
        vehicle: vehicleSelect.value,
        origin: document.getElementById('t-origin').value,
        destination: document.getElementById('t-destination').value,
        scheduledDate: document.getElementById('t-date').value,
        isRoundTrip: document.getElementById('t-round-trip').checked, // <-- ADDED COMMA HERE
        fuelType: document.getElementById('t-fuel-type').value 
      };

      const trip = await Api.post('/trips', data);

      // Show Results
      resultsDiv.innerHTML = `
        <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p class="text-green-800 font-bold mb-2">✅ Route Calculated! (${trip.fuelType})</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-slate-500">Total Distance</p>
              <p class="text-xl font-bold text-blue-800">${trip.distanceKm} km</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">Est. Fuel</p>
              <p class="text-xl font-bold text-amber-600">${trip.estimatedFuelLiters} L</p>
            </div>
          </div>
        </div>
      `;

      form.reset();
      loadTrips(); // Refresh the list below

    } catch (error) {
      resultsDiv.innerHTML = `<p class="text-red-500 text-center font-bold">❌ ${error.message}</p>`;
    } finally {
      btn.innerText = 'Calculate & Schedule Route';
      btn.disabled = false;
    }
  });

  // Initialize
  loadVehicles();
  loadTrips();
});