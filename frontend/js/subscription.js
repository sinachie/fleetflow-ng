document.addEventListener('DOMContentLoaded', async () => {
  const plansEl = document.getElementById('plans');
  
  // 1. Define the features for each plan
  const features = {
    starter: [
      "✅ Up to 5 Vehicles",
      "✅ Basic Maintenance Logs",
      "✅ Standard Driver Comms",
      "❌ Predictive Maintenance",
      "❌ ELD Route Optimization"
    ],
    professional: [
      "✅ Up to 30 Vehicles",
      "✅ Predictive Maintenance Alerts",
      "✅ Real-time Comms & Broadcasts",
      "✅ ELD Route Optimization",
      "❌ Dedicated Account Manager"
    ],
    enterprise: [
      "✅ Unlimited Vehicles",
      "✅ Full AI Predictive Maintenance",
      "✅ Unlimited Real-time Comms",
      "✅ Advanced ELD Analytics",
      "✅ API Access & ERP Integration",
      "✅ 24/7 Phone Support"
    ]
  };

  const labels = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };
  const highlight = { starter: false, professional: true, enterprise: false };

  try {
    const { prices } = await Api.get('/subscriptions/plans');

    // 2. Render the plans into the HTML
    plansEl.innerHTML = Object.entries(prices).map(([plan, cycles]) => `
      <div class="bg-white rounded-xl shadow p-5 text-center border ${highlight[plan] ? 'border-blue-500 border-2' : 'border-transparent'}">
        ${highlight[plan] ? '<span class="inline-block bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-1">POPULAR</span>' : ''}
        <h3 class="font-bold text-blue-900 text-lg">${labels[plan]}</h3>
        <p class="text-2xl font-bold text-blue-800 mt-2">₦${cycles.yearly.toLocaleString()}</p>
        <p class="text-xs text-slate-500 mb-4">/ year (or ₦${cycles.monthly.toLocaleString()} / month)</p>
        
        <ul class="text-sm text-left text-slate-600 mb-6 space-y-2 border-t pt-4">
          ${features[plan].map(f => `<li>${f}</li>`).join('')}
        </ul>

        <button onclick="subscribe('${plan}', 'yearly', this)" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">Choose ${labels[plan]}</button>
      </div>
    `).join('');
    
  } catch (e) {
    plansEl.innerHTML = `<p class="text-red-500 text-sm col-span-3">Failed to load plans: ${e.message}</p>`;
  }
});

// 4. The subscribe function (FIXED)
async function subscribe(plan, billingCycle, btn) {
  try {
    // Get user from localStorage (assuming they are logged in)
    const userStr = localStorage.getItem('ff_user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Declare email and company ONCE
    let email;
    let company;

    if (user) {
      // If logged in, use their stored data
      email = user.email;
      company = user.company || 'FleetFlow User';
    } else {
      // If not logged in, ask them
      email = prompt('Enter your email address for the receipt:');
      if (!email) return;
      company = prompt('Company name for subscription:') || 'Demo Co.';
    }

    // Show loading state
    btn.innerText = 'Processing...';
    btn.disabled = true;

    const response = await Api.post('/subscriptions/initialize', {
      company,
      email,
      plan,
      billingCycle,
      userId: user ? user.id : null // Pass user ID if they exist
    });

    if (response.authorization_url) {
      window.location.href = response.authorization_url;
    } else {
      throw new Error('No checkout URL returned');
    }

  } catch (e) {
    alert(`❌ ${e.message}`);
    btn.innerText = 'Choose Plan';
    btn.disabled = false;
  }
}