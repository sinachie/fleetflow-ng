const Subscription = require('../models/Subscription');

const PRICES = {
  starter: { monthly: 20000, yearly: 150000 },
  professional: { monthly: 50000, yearly: 450000 },
  enterprise: { monthly: 90000, yearly: 850000 },
};

exports.listPlans = (_req, res) => {
  res.json({ prices: PRICES, currency: 'NGN' });
};

exports.createSubscription = async (req, res) => {
  try {
    const { company, plan, billingCycle } = req.body;
    if (!PRICES[plan]) return res.status(400).json({ message: 'Invalid plan' });

    const amount = PRICES[plan][billingCycle];
    if (!amount) return res.status(400).json({ message: 'Invalid billing cycle' });

    const renewsAt = new Date();
    if (billingCycle === 'monthly') renewsAt.setMonth(renewsAt.getMonth() + 1);
    else renewsAt.setFullYear(renewsAt.getFullYear() + 1);

    const sub = await Subscription.create({
      company,
      plan,
      billingCycle,
      amountNGN: amount,
      renewsAt,
      paystackRef: `demo_${Date.now()}`,
    });

    // NOTE: In production, call Paystack Initialize Transaction here
    // and return an authorization_url for the client.
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listSubscriptions = async (_req, res) => {
  try {
    const subs = await Subscription.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};