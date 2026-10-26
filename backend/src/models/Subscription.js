const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    plan: { type: String, enum: ['starter', 'professional', 'enterprise'], required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    amountNGN: { type: Number, required: true },
    status: { type: String, enum: ['active', 'past_due', 'cancelled'], default: 'active' },
    startedAt: { type: Date, default: Date.now },
    renewsAt: { type: Date },
    paystackRef: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);