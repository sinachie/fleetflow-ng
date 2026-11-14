document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('vehicleRows');
  let allDrivers = [];

  // 1. Fetch drivers for the assignment dropdown
  try {
    const team = await Api.get('/auth/team');
    allDrivers = team.filter(u => u.role === 'driver');
  } catch (e) { 
    console.log("Could not load drivers", e); 
  }

  // 2. Load and render vehicles
  async function loadVehicles() {
    try {
      const vehicles = await Api.get('/vehicles');
      if (!vehicles.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-slate-400 text-sm text-center">No vehicles yet. Click "Add Vehicle" to start.</td></tr>`;
        return;
      }

      tbody.innerHTML = vehicles.map((v) => {
        // Build the driver dropdown options
        let driverOptions = `<option value="">Unassigned</option>`;
        allDrivers.forEach(d => {
          const isSelected = v.driver && v.driver._id === d._id ? 'selected' : '';
          driverOptions += `<option value="${d._id}" ${isSelected}>${d.name}</option>`;
        });

        // 🔥 THE FIX: Calculate offline status INSIDE the map function
        const isOffline = v.lastLocationUpdate && (new Date() - new Date(v.lastLocationUpdate)) > 5 * 60 * 1000;
        const statusText = isOffline 
          ? `<span class="text-red-500 font-bold text-xs ml-2">● OFFLINE</span>` 
          : `<span class="text-green-500 font-bold text-xs ml-2">● LIVE</span>`;

        return `
        <tr class="border-t hover:bg-blue-50">
          <td class="p-3 font-semibold text-blue-800">
            ${v.plateNumber}
            ${statusText} <!-- ADDED STATUS HERE -->
          </td>
          <td class="p-3">${v.model}</td>
          <td class="p-3">
             <select onchange="assignDriver('${v._id}', this.value)" class="text-xs border rounded p-1 bg-white">
                ${driverOptions}
             </select>
          </td>
          <td class="p-3">
            <span class="text-xs px-2 py-1 rounded ${
              v.status === 'active' ? 'bg-green-100 text-green-700' :
              v.status === 'critical' ? 'bg-red-100 text-red-700' :
              v.status === 'maintenance' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-600'
            }">${v.status || 'idle'}</span>
          </td>
          <td class="p-3">${v.odometerKm || 0} km</td>
          <td class="p-3">${v.fuelLiters || 0} L</td>
          <td class="p-3">
            <button onclick="shareLocation('${v.plateNumber}')" class="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded">📍 Update GPS</button>
          </td>
        </tr>
      `}).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-red-500 text-sm text-center">${e.message}</td></tr>`;
    }
  }

  // 3. Form Submission for Adding a Vehicle
  const form = document.getElementById('addVehicleForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('saveVehicleBtn');
      btn.innerText = 'Saving...';
      btn.disabled = true;

      const vehicleData = {
        plateNumber: document.getElementById('v-plate').value,
        model: document.getElementById('v-model').value,
        odometerKm: document.getElementById('v-odometer').value,
        fuelLiters: document.getElementById('v-fuel').value,
        status: document.getElementById('v-status').value
      };

      try {
        await Api.post('/vehicles', vehicleData);
        window.location.reload(); 
      } catch (error) {
        alert(`❌ ${error.message}`);
        btn.innerText = 'Save Vehicle';
        btn.disabled = false;
      }
    });
  }

  // Initialize the load
  loadVehicles();
});

// --- OUTSIDE FUNCTIONS (Accessible to HTML onclick) ---

// Assign driver to vehicle
window.assignDriver = async (vehicleId, driverId) => {
  try {
    await Api.put(`/vehicles/${vehicleId}`, { driver: driverId || null });
    alert('Driver assigned successfully!');
  } catch (e) {
    alert('Error assigning driver: ' + e.message);
  }
};

// Modal Functions
function openVehicleModal() {
  const modal = document.getElementById('vehicleModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicleModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('addVehicleForm').reset();
  }
}

// Export Vehicles to CSV
async function exportVehiclesToCSV() {
  try {
    const vehicles = await Api.get('/vehicles');
    if (vehicles.length === 0) return alert('No vehicles to export.');

    const headers = ['Plate Number', 'Model', 'Status', 'Odometer (km)', 'Fuel (Liters)', 'Fuel Efficiency (km/L)'];
    
    const rows = vehicles.map(v => [
      v.plateNumber,
      v.model,
      v.status || 'idle',
      v.odometerKm || 0,
      v.fuelLiters || 0,
      v.fuelEfficiency || 0
    ]);

    let csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FleetFlow_Vehicles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    alert(`❌ Failed to export: ${error.message}`);
  }
}

// Simulate a driver sharing their location
function shareLocation(plateNumber) {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      await Api.post('/vehicles/update-location', {
        plateNumber: plateNumber,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      alert(`Location updated for ${plateNumber}! Check the ELD Map tab.`);
    } catch (e) {
      alert(`❌ Failed to update location: ${e.message}`);
    }
  }, () => {
    alert("Unable to retrieve your location. Please allow location access.");
  });
}

// --- LOG FUEL FUNCTIONS ---
async function openFuelModal() {
  document.getElementById('fuelModal').classList.remove('hidden');
  document.getElementById('fuelModal').classList.add('flex');
  
  const select = document.getElementById('f-vehicle');
  try {
    const vehicles = await Api.get('/vehicles');
    select.innerHTML = vehicles.map(v => 
      `<option value="${v._id}">${v.plateNumber} - ${v.model} (Last Odo: ${v.odometerKm} km)</option>`
    ).join('');
  } catch (e) { console.log(e); }
}

function closeFuelModal() {
  document.getElementById('fuelModal').classList.add('hidden');
  document.getElementById('fuelModal').classList.remove('flex');
  document.getElementById('logFuelForm').reset();
}

document.getElementById('logFuelForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerText = 'Saving...';
  btn.disabled = true;

  const data = {
    vehicleId: document.getElementById('f-vehicle').value,
    liters: document.getElementById('f-liters').value,
    currentOdometer: document.getElementById('f-odometer').value
  };

  try {
    await Api.post('/vehicles/log-fuel', data);
    alert('Fuel logged successfully!');
    closeFuelModal();
    window.location.reload(); 
  } catch (error) {
    alert(`❌ ${error.message}`);
    btn.innerText = 'Save Fuel Log';
    btn.disabled = false;
  }
});