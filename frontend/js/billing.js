document.addEventListener('DOMContentLoaded', () => {
  loadBilling();
});

async function loadBilling() {
  const container = document.getElementById('billingContent');
  try {
    const sub = await Api.get('/subscriptions/my-plan');
    
    container.innerHTML = `
      <div class="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <p class="text-xs uppercase text-slate-400 font-semibold">Current Plan</p>
          <h3 class="text-2xl font-bold text-blue-900 capitalize">${sub.plan}</h3>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase text-slate-400 font-semibold">Amount</p>
          <p class="text-lg font-bold text-blue-900">₦${sub.amountNGN.toLocaleString()} / ${sub.billingCycle}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-xs uppercase text-slate-400 font-semibold">Next Billing Date</p>
          <p class="font-medium text-slate-800">${new Date(sub.renewsAt).toDateString()}</p>
        </div>
        <div>
          <p class="text-xs uppercase text-slate-400 font-semibold">Status</p>
          <span class="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase mt-1">${sub.status}</span>
        </div>
      </div>

      <div class="flex gap-4">
        <button onclick="window.location.href='#subscription'" class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Upgrade Plan</button>
        <button onclick="cancelPlan()" class="border border-red-500 text-red-500 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-50">Cancel Subscription</button>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `
      <div class="text-center py-8">
        <p class="text-slate-500 mb-4">You do not have an active subscription.</p>
        <button onclick="window.location.href='#subscription'" class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">View Plans</button>
      </div>
    `;
  }
}

async function cancelPlan() {
  if (!confirm('Are you sure you want to cancel? You will lose access to premium features at the end of the billing cycle.')) return;
  
  try {
    await Api.post('/subscriptions/cancel', {});
    alert('Subscription cancelled.');
    loadBilling();
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
}