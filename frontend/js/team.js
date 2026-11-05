document.addEventListener('DOMContentLoaded', async () => {
  const teamRows = document.getElementById('teamRows');

  // Load Team Members
  async function loadTeam() {
    try {
      const team = await Api.get('/auth/team');
      if (team.length === 0) {
        teamRows.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-500">No team members yet.</td></tr>`;
      } else {
        teamRows.innerHTML = team.map(user => `
          <tr class="border-t hover:bg-slate-50">
            <td class="p-3 font-semibold text-blue-900">${user.name}</td>
            <td class="p-3">${user.email}</td>
            <td class="p-3">
              <span class="text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">
                ${user.role.toUpperCase()}
              </span>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) { console.log(e); }
  }

  // Handle Form Submission
  const form = document.getElementById('addTeamForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('saveTeamBtn');
      btn.innerText = 'Creating...';
      btn.disabled = true;

      try {
        await Api.post('/auth/team', {
          name: document.getElementById('tm-name').value,
          email: document.getElementById('tm-email').value,
          password: document.getElementById('tm-password').value,
          role: document.getElementById('tm-role').value
        });
        
        closeTeamModal();
        loadTeam(); // Refresh list
        alert('Team member created successfully!');
      } catch (error) {
        alert(`❌ Error: ${error.message}`);
      } finally {
        btn.innerText = 'Create User';
        btn.disabled = false;
      }
    });
  }

  // Load team when page opens
  loadTeam();
});

function openTeamModal() {
  document.getElementById('teamModal').classList.remove('hidden');
  document.getElementById('teamModal').classList.add('flex');
}

function closeTeamModal() {
  document.getElementById('teamModal').classList.add('hidden');
  document.getElementById('teamModal').classList.remove('flex');
  document.getElementById('addTeamForm').reset();
}