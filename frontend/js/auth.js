document.addEventListener('DOMContentLoaded', () => {
  const authScreen = document.getElementById('auth-screen');
  const form = document.getElementById('auth-form');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const submitBtn = document.getElementById('auth-submit');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const toggleText = document.getElementById('auth-toggle-text');
  
  // Groups to hide/show
  const nameGroup = document.getElementById('name-group');
  const companyGroup = document.getElementById('company-group');

  let isLoginMode = true;

  // 1. Check if user is already logged in
  const existingToken = localStorage.getItem('ff_token');
  if (existingToken) {
    authScreen.classList.add('hidden'); // Hide screen if logged in
  }

  // 2. Toggle between Login and Register
  toggleBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
      title.innerText = 'Welcome Back';
      subtitle.innerText = 'Log in to manage your fleet';
      submitBtn.innerText = 'Log In';
      toggleText.innerText = "Don't have an account?";
      toggleBtn.innerText = 'Register';
      nameGroup.classList.add('hidden');
      companyGroup.classList.add('hidden');
    } else {
      title.innerText = 'Create an Account';
      subtitle.innerText = 'Start managing your fleet today';
      submitBtn.innerText = 'Register';
      toggleText.innerText = "Already have an account?";
      toggleBtn.innerText = 'Log In';
      nameGroup.classList.remove('hidden');
      companyGroup.classList.remove('hidden');
    }
  });

  // 3. Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const company = document.getElementById('auth-company').value;

    submitBtn.innerText = 'Processing...';
    submitBtn.disabled = true;

    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const body = isLoginMode 
        ? { email, password } 
        : { name, email, password, company, role: 'admin' };

      const data = await Api.post(endpoint, body);

      // Save token and user to localStorage
      Api.setToken(data.token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));

      // ADD THIS CHECK:
      if (data.user.role === 'driver') {
        window.location.href = 'driver.html';
      } else {
        authScreen.classList.add('hidden');
        window.location.reload();
      }

    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      submitBtn.innerText = isLoginMode ? 'Log In' : 'Register';
      submitBtn.disabled = false;
    }
  });
});

// Function to check the user's plan and reveal the Enterprise tab
async function checkEnterpriseAccess() {
  try {
    // We only check if the user is logged in
    const token = localStorage.getItem('ff_token');
    if (!token) return;

    const sub = await Api.get('/subscriptions/my-plan');
    
    if (sub && sub.plan === 'enterprise') {
      // Show Desktop button
      const desktopBtn = document.getElementById('nav-enterprise-desktop');
      if (desktopBtn) desktopBtn.classList.remove('hidden');

      // Show Mobile button
      const mobileBtn = document.getElementById('nav-enterprise-mobile');
      if (mobileBtn) mobileBtn.classList.remove('hidden');
    }
  } catch (e) {
    // If they don't have a plan, the API returns an error. We just do nothing.
    console.log("No active subscription found, hiding Enterprise tab.");
  }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a small moment for the API setup to finish
  setTimeout(checkEnterpriseAccess, 500);
});

// --- LOGOUT LOGIC ---
function logoutUser() {
  // 1. Ask for confirmation
  if (!confirm('Are you sure you want to log out?')) return;

  // 2. Clear the token and user data from the browser
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');

  // 3. Redirect back to the login screen
  window.location.reload();
}