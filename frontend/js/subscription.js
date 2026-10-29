document.addEventListener('DOMContentLoaded', async () => {
  const plansEl = document.getElementById('plans');
  try {
    const { prices } = await Api.get('/subscriptions/plans');
    const labels = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };
    const highlight = { starter: false, professional: true, enterprise: false };

    plansEl.innerHTML = Object.entries(prices).map(([plan, cycles]) => `
      <div class="bg-white rounded-xl shadow p-5 text-center border ${highlight[plan] ? 'border-blue-500 border-2' : 'border-transparent'}">
        ${highlight[plan] ? '<span class="inline-block bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-1">POPULAR</span>' : ''}
        <h3 class="font-bold text-blue-900">${labels[plan]}</h3>
        <p class="text-2xl font-bold text-blue-800 mt-2">₦${cycles.yearly.toLocaleString()}</p>
        <p class="text-xs text-slate-500">/ year (or ₦${cycles.monthly.toLocaleString()} / month)</p>
        <button onclick="subscribe('${plan}', 'yearly', this)" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold">Choose ${labels[plan]}</button>
      </div>
    `).join('');
  } catch (e) {
    plansEl.innerHTML = `<p class="text-red-500 text-sm">Failed to load plans: ${e.message}</p>`;
  }
});

async function subscribe(plan, billingCycle, btn) {
  try {
    const email = prompt('Enter your email address for the receipt:');
    if (!email) return;
    
    const company = prompt('Company name for subscription:') || 'Demo Co.';

    const originalText = btn.innerText;
    btn.innerText = 'Processing...';
    btn.disabled = true;

    const response = await Api.post('/subscriptions/initialize', {
      company,
      email,
      plan,
      billingCycle,
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