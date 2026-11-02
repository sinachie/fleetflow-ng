document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('vehicleRows');
  try {
    const vehicles = await Api.get('/vehicles');
    if (!vehicles.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-slate-400 text-sm">No vehicles registered yet.</td></tr>`;
      return;
    }
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
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-red-500 text-sm">${e.message}</td></tr>`;
  }
});

// --- MODAL LOGIC ---
function openVehicleModal() {
  document.getElementById('vehicleModal').classList.remove('hidden');
  document.getElementById('vehicleModal').classList.add('flex');
}

function closeVehicleModal() {
  document.getElementById('vehicleModal').classList.add('hidden');
  document.getElementById('vehicleModal').classList.remove('flex');
  document.getElementById('addVehicleForm').reset();
}

// --- FORM SUBMISSION (SENDING TO BACKEND) ---
document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = document.getElementById('saveVehicleBtn');
  btn.innerText = 'Saving...';
  btn.disabled = true;

  const vehicleData = {
    plateNumber: document.getElementById('v-plate').value,
    model: document.getElementById('v-model').value,
    odometerKm: document.getElementById('v-odometer').value,
    fuelLiters: document.getElementById('v-fuel').value,
    status: 'active' // Default status
  };

  try {
    // Send to your backend
    await Api.post('/vehicles', vehicleData);
    
    // Close modal and reload the page to show the new vehicle
    closeVehicleModal();
    window.location.reload(); 
    
  } catch (error) {
    // If it fails (e.g., you hit the Starter limit of 5), show the error message!
    alert(`❌ ${error.message}`);
    btn.innerText = 'Save Vehicle';
    btn.disabled = false;
  }
});