document.addEventListener('DOMContentLoaded', async () => {
  const plansEl = document.getElementById('plans');
  try {
    const { prices, currency } = await Api.get('/subscriptions/plans');
    const labels = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };
    const highlight = { starter: false, professional: true, enterprise: false };

    plansEl.innerHTML = Object.entries(prices).map(([plan, cycles]) => `
      <div class="bg-white rounded-xl shadow p-5 text-center border ${highlight[plan] ? 'border-blue-500 border-2' : 'border-transparent'}">
        ${highlight[plan] ? '<span class="inline-block bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-1">POPULAR</span>' : ''}
        <h3 class="font-bold text-blue-900">${labels[plan]}</h3>
        <p class="text-2xl font-bold text-blue-800 mt-2">₦${cycles.yearly.toLocaleString()}</p>
        <p class="text-xs text-slate-500">/ year (or ₦${cycles.monthly.toLocaleString()} / month)</p>
        <button onclick="subscribe('${plan}', 'yearly')" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold">Choose ${labels[plan]}</button>
      </div>
    `).join('');
  } catch (e) {
    plansEl.innerHTML = `<p class="text-red-500 text-sm">${e.message}</p>`;
  }
});

async function subscribe(plan, billingCycle) {
  try {
    const company = prompt('Company name for subscription:') || 'Demo Co.';
    const sub = await Api.post('/subscriptions', { company, plan, billingCycle });
    alert(`✅ ${plan.toUpperCase()} plan activated for ${sub.company}.\nAmount: ₦${sub.amountNGN.toLocaleString()}\nRenews: ${new Date(sub.renewsAt).toDateString()}`);
  } catch (e) {
    alert(`❌ ${e.message}`);
  }
}