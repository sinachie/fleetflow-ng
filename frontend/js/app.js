// Navigation + shared bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Toggle Mobile Menu
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
    });
  }

  // Main Page Navigation Function
  function showPage(id) {
  // 1. Hide all pages
  pages.forEach((p) => p.classList.add('hidden'));
  
  // 2. Show the selected page
  const targetPage = document.getElementById(`page-${id}`);
  if (targetPage) targetPage.classList.remove('hidden');
  
  // 3. Update nav buttons active state
  navBtns.forEach((b) => b.classList.toggle('active', b.dataset.page === id));

  // 4. Close mobile menu if it's open
  if (mobileMenu) {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
  }

    
  // Inside your showPage function in app.js
  if (id === 'eld' && window.map) {
    setTimeout(() => {
      window.map.invalidateSize(); 
    }, 400);
  }

  // 6. Load Enterprise Data
  if (id === 'enterprise') {
    loadEnterpriseData();
  }
}

  // Add click events to all nav buttons
  navBtns.forEach((btn) =>
    btn.addEventListener('click', () => showPage(btn.dataset.page))
  );

  // Initialize with Dashboard
  showPage('dashboard');
});

// --- ENTERPRISE FUNCTIONS (Must be outside DOMContentLoaded) ---

async function loadEnterpriseData() {
  try {
    const user = await Api.get('/auth/me');
    document.getElementById('apiKeyDisplay').value = user.apiKey || '';
    document.getElementById('erpUrlInput').value = user.erpWebhookUrl || '';
  } catch(e) { 
    console.log("Could not load enterprise data:", e.message); 
  }
}

async function generateApiKey() {
  try {
    const res = await Api.post('/auth/generate-api-key', {});
    document.getElementById('apiKeyDisplay').value = res.apiKey;
    alert('API Key generated successfully!');
  } catch(e) { 
    alert(`❌ Error: ${e.message}`); 
  }
}

async function saveErpUrl() {
  try {
    const url = document.getElementById('erpUrlInput').value;
    await Api.put('/auth/erp-url', { erpWebhookUrl: url });
    alert('ERP URL saved successfully!');
  } catch(e) { 
    alert(`❌ Error: ${e.message}`); 
  }
}