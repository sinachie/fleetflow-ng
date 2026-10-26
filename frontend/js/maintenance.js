document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('maintenanceList');
  try {
    const records = await Api.get('/maintenance');
    if (!records.length) {
      list.innerHTML = `<p class="text-slate-400">No maintenance records yet.</p>`;
      return;
    }
    list.innerHTML = records.map((m) => `
      <div class="flex justify-between items-center border-b py-2">
        <div>
          <p class="font-medium text-slate-800">${m.vehicle?.plateNumber || 'Unknown'} • ${m.serviceType}</p>
          <p class="text-xs text-slate-500">Due: ${m.dueAtKm ? m.dueAtKm + ' km' : m.dueAtDate ? new Date(m.dueAtDate).toDateString() : 'N/A'}</p>
        </div>
        <span class="text-xs px-2 py-1 rounded ${
          m.status === 'critical' ? 'bg-red-100 text-red-700' :
          m.status === 'due-soon' ? 'bg-amber-100 text-amber-700' :
          m.status === 'completed' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }">${m.status}</span>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = `<p class="text-red-500 text-sm">${e.message}</p>`;
  }
});