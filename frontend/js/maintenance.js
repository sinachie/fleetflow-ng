document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('maintenanceList');
  
  // 1. Load Maintenance Records
  try {
    const records = await Api.get('/maintenance');
    if (!records.length) {
      list.innerHTML = `<p class="text-slate-400 text-center">No maintenance records yet.</p>`;
    } else {
      list.innerHTML = records.map((m) => `
        <div class="flex justify-between items-center border-b py-2">
          <div>
            <p class="font-medium text-slate-800">${m.vehicle?.plateNumber || 'Unknown Vehicle'} • ${m.serviceType}</p>
            <p class="text-xs text-slate-500">Due: ${m.dueAtKm ? m.dueAtKm + ' km' : 'N/A'}</p>
          </div>
          <span class="text-xs px-2 py-1 rounded ${
            m.status === 'critical' ? 'bg-red-100 text-red-700' :
            m.status === 'due-soon' ? 'bg-amber-100 text-amber-700' :
            m.status === 'completed' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }">${m.status}</span>
        </div>
      `).join('');
    }
  } catch (e) {
    list.innerHTML = `<p class="text-red-500 text-sm">${e.message}</p>`;
  }

  // 2. Form Submission
  const form = document.getElementById('addMaintenanceForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('saveMaintenanceBtn');
      btn.innerText = 'Saving...';
      btn.disabled = true;

      const data = {
        vehicle: document.getElementById('m-vehicle').value, // This now grabs the ID from the dropdown
        serviceType: document.getElementById('m-service').value,
        dueAtKm: document.getElementById('m-km').value,
        status: 'due-soon'
      };

      try {
        await Api.post('/maintenance', data);
        window.location.reload(); 
      } catch (error) {
        alert(`❌ ${error.message}`);
        btn.innerText = 'Save Record';
        btn.disabled = false;
      }
    });
  }
});

// 3. Modal Functions
async function openMaintenanceModal() {
  document.getElementById('maintenanceModal').classList.remove('hidden');
  document.getElementById('maintenanceModal').classList.add('flex');
  
  // Load vehicles into the dropdown when the modal opens
  const select = document.getElementById('m-vehicle');
  try {
    const vehicles = await Api.get('/vehicles');
    if (vehicles.length === 0) {
      select.innerHTML = `<option value="">No vehicles found. Add a vehicle first.</option>`;
    } else {
      // This creates an option for each vehicle, using the _id as the value and the plate number as the text
      select.innerHTML = vehicles.map(v => 
        `<option value="${v._id}">${v.plateNumber} - ${v.model}</option>`
      ).join('');
    }
  } catch (error) {
    select.innerHTML = `<option value="">Error loading vehicles</option>`;
  }
}

function closeMaintenanceModal() {
  document.getElementById('maintenanceModal').classList.add('hidden');
  document.getElementById('maintenanceModal').classList.remove('flex');
  document.getElementById('addMaintenanceForm').reset();
}

// --- EXPORT MAINTENANCE TO CSV ---
async function exportMaintenanceToCSV() {
  try {
    // 1. Fetch the latest data
    const records = await Api.get('/maintenance');
    if (records.length === 0) return alert('No maintenance records to export.');

    // 2. Define headers
    const headers = ['Vehicle Plate', 'Service Type', 'Status', 'Due At (km)', 'Notes'];
    
    // 3. Map the data
    const rows = records.map(m => [
      m.vehicle ? m.vehicle.plateNumber : 'Unknown',
      m.serviceType,
      m.status,
      m.dueAtKm || 'N/A',
      m.notes || ''
    ]);

    // 4. Create the CSV string (Wrap text in quotes to prevent comma issues in Excel)
    let csvContent = headers.join(',') + '\n' + rows.map(e => e.map(item => `"${item}"`).join(',')).join('\n');

    // 5. Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FleetFlow_Maintenance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    alert(`❌ Failed to export: ${error.message}`);
  }
}