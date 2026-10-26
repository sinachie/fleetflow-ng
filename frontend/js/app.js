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