document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('vehicleRows');
  
  // 1. Load Vehicles
  try {
    const vehicles = await Api.get('/vehicles');
    if (!vehicles.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-slate-400 text-sm text-center">No vehicles yet. Click "Add Vehicle" to start.</td></tr>`;
    } else {
      tbody.innerHTML = vehicles.map((v) => `
        <tr class="border-t hover:bg-blue-50">
          <td class="p-3 font-semibold text-blue-800">${v.plateNumber}</td>
          <td class="p-3">${v.model}</td>
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
        </tr>
      `).join('');
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-red-500 text-sm text-center">${e.message}</td></tr>`;
  }

  // 2. Form Submission (Must be inside DOMContentLoaded)
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
});

// 3. Modal Functions (Must be outside so the HTML onclick can see them)
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

// --- EXPORT VEHICLES TO CSV ---
async function exportVehiclesToCSV() {
  try {
    // 1. Fetch the latest data
    const vehicles = await Api.get('/vehicles');
    if (vehicles.length === 0) return alert('No vehicles to export.');

    // 2. Define the CSV headers
    const headers = ['Plate Number', 'Model', 'Status', 'Odometer (km)', 'Fuel (Liters)', 'Fuel Efficiency (km/L)'];
    
    // 3. Map the data to rows
    const rows = vehicles.map(v => [
      v.plateNumber,
      v.model,
      v.status || 'idle',
      v.odometerKm || 0,
      v.fuelLiters || 0,
      v.fuelEfficiency || 0
    ]);

    // 4. Create the CSV string
    let csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');

    // 5. Trigger download
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