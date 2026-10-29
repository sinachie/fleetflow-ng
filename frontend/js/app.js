// Navigation + shared bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');

  function showPage(id) {
    pages.forEach((p) => p.classList.add('hidden'));
    document.getElementById(`page-${id}`)?.classList.remove('hidden');
    navBtns.forEach((b) => b.classList.toggle('active', b.dataset.page === id));
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