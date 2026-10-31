const Subscription = require('../models/Subscription');
const crypto = require('crypto');

const PRICES = {
  starter: { monthly: 20000, yearly: 150000 },
  professional: { monthly: 50000, yearly: 450000 },
  enterprise: { monthly: 90000, yearly: 850000 },
};

exports.listPlans = (_req, res) => {
  res.json({ prices: PRICES, currency: 'NGN' });
};

// 1. INITIALIZE PAYMENT (Called by Frontend)
exports.initializePayment = async (req, res) => {
  try {
    const { company, email, plan, billingCycle } = req.body;
    
    if (!PRICES[plan]) return res.status(400).json({ message: 'Invalid plan' });
    const amount = PRICES[plan][billingCycle];
    if (!amount) return res.status(400).json({ message: 'Invalid billing cycle' });

    // Paystack expects amount in Kobo (multiply by 100)
    const amountInKobo = amount * 100;

    // Call Paystack API to initialize transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || 'customer@fleetflow.com.ng', // Paystack requires an email
        amount: amountInKobo,
        metadata: {
          company,
          plan,
          billingCycle,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ message: 'Paystack initialization failed', error: data.message });
    }

    // Return the secure checkout URL to the frontend
    res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. PAYSTACK WEBHOOK (Called by Paystack servers)
exports.paystackWebhook = async (req, res) => {
  try {
    // Validate event came from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.log('⚠️ Invalid Paystack signature');
      return res.sendStatus(400);
    }

    const event = req.body;

    // Handle successful charge
    if (event.event === 'charge.success') {
      const { metadata, reference, customer } = event.data;

      // Create subscription in the database
      const renewsAt = new Date();
      if (metadata.billingCycle === 'monthly') {
        renewsAt.setMonth(renewsAt.getMonth() + 1);
      } else {
        renewsAt.setFullYear(renewsAt.getFullYear() + 1);
      }

      // Inside paystackWebhook -> if (event.event === 'charge.success') { ... }

      await Subscription.create({
        user: event.data.metadata.userId, // We will pass this from the frontend
        company: metadata.company,
        plan: metadata.plan,
        billingCycle: metadata.billingCycle,
        amountNGN: event.data.amount / 100,
        status: 'active',
        renewsAt,
        paystackRef: reference,
        paystackAuthCode: event.data.authorization.authorization_code // <-- Save the card!
      });

      console.log(`✅ Payment successful for ${metadata.company} - Ref: ${reference}`);
    }

    // Return 200 OK to Paystack to stop them from retrying
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.sendStatus(500);
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

// Get the current user's active subscription
exports.getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!sub) return res.status(404).json({ message: 'No active subscription found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!sub) return res.status(404).json({ message: 'No active subscription' });
    
    // In a real app, you might call Paystack to disable the plan here.
    sub.status = 'cancelled';
    await sub.save();
    
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};