// Navigation + shared bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');

  function showPage(id) {
  pages.forEach((p) => p.classList.add('hidden'));
  document.getElementById(`page-${id}`)?.classList.remove('hidden');
  
  navBtns.forEach((b) => b.classList.toggle('active', b.dataset.page === id));

  // Fix Leaflet Map rendering when the ELD tab is clicked
  if (id === 'eld' && window.map) {
    setTimeout(() => {
      window.map.invalidateSize();
    }, 200);
  }
}
  navBtns.forEach((btn) =>
    btn.addEventListener('click', () => showPage(btn.dataset.page))
  );

  showPage('dashboard');
});

document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Toggle Mobile Menu
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
  });

  function showPage(id) {
    pages.forEach((p) => p.classList.add('hidden'));
    document.getElementById(`page-${id}`)?.classList.remove('hidden');
    
    // Update active state on all buttons
    navBtns.forEach((b) => b.classList.toggle('active', b.dataset.page === id));

    // Close mobile menu on click
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
  }

  navBtns.forEach((btn) =>
    btn.addEventListener('click', () => showPage(btn.dataset.page))
  );

  showPage('dashboard');
});

// Add this inside the showPage function in app.js
if (id === 'enterprise') {
  loadEnterpriseData();
}

async function loadEnterpriseData() {
  try {
    const user = await Api.get('/auth/me');
    document.getElementById('apiKeyDisplay').value = user.apiKey || '';
    document.getElementById('erpUrlInput').value = user.erpWebhookUrl || '';
  } catch(e) { console.log(e) }
}

async function generateApiKey() {
  try {
    const res = await Api.post('/auth/generate-api-key', {});
    document.getElementById('apiKeyDisplay').value = res.apiKey;
    alert('API Key generated!');
  } catch(e) { alert(e.message); }
}

async function saveErpUrl() {
  try {
    const url = document.getElementById('erpUrlInput').value;
    await Api.put('/auth/erp-url', { erpWebhookUrl: url });
    alert('ERP URL saved!');
  } catch(e) { alert(e.message); }
}