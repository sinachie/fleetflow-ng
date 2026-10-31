const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  plan: { type: String, enum: ['starter', 'professional', 'enterprise'], required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
  amountNGN: { type: Number, required: true },
  status: { type: String, enum: ['active', 'past_due', 'cancelled'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  renewsAt: { type: Date },
  paystackRef: { type: String },
  paystackAuthCode: { type: String } // <-- ADD THIS to save the card for upgrades
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);