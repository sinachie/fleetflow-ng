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

      // CHECK ROLE AND REDIRECT
      if (data.user.role === 'driver') {
        window.location.href = 'driver.html'; // Send to Driver Portal
      } else {
        authScreen.classList.add('hidden');
        window.location.reload(); // Stay on Admin Dashboard
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

document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.innerText = 'Updating...';
  btn.disabled = true;

  try {
    await Api.put('/auth/change-password', {
      currentPassword: document.getElementById('current-password').value,
      newPassword: document.getElementById('new-password').value
    });
    alert('✅ Password updated successfully!');
    document.getElementById('changePasswordForm').reset();
  } catch (error) {
    alert(`❌ ${error.message}`);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
});

// Universal Show/Hide Password Toggle
function togglePassword(inputId, btnElement) {
  const input = document.getElementById(inputId);
  
  if (input.type === 'password') {
    // Show password
    input.type = 'text';
    // Change icon to "Eye Off" (slashed eye)
    btnElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    `;
  } else {
    // Hide password
    input.type = 'password';
    // Change icon back to "Eye"
    btnElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    `;
  }
}