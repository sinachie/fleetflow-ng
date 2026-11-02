document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('maintenanceList');
  
  // 1. Load Records
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
        vehicle: document.getElementById('m-vehicle').value,
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
function openMaintenanceModal() {
  document.getElementById('maintenanceModal').classList.remove('hidden');
  document.getElementById('maintenanceModal').classList.add('flex');
}

function closeMaintenanceModal() {
  document.getElementById('maintenanceModal').classList.add('hidden');
  document.getElementById('maintenanceModal').classList.remove('flex');
  document.getElementById('addMaintenanceForm').reset();
}