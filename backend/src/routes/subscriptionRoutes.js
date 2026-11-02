const express = require('express');
const router = express.Router();
const {
  listPlans,
  listSubscriptions,
  initializePayment,
  paystackWebhook,
  getMySubscription,
  cancelSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public routes (Anyone can see the plans and Paystack needs to access the webhook)
router.get('/plans', listPlans);
router.post('/webhook', paystackWebhook);

// Protected routes (Must be logged in to pay or manage subscriptions)
router.post('/initialize', protect, initializePayment);
router.get('/my-plan', protect, getMySubscription);
router.post('/cancel', protect, cancelSubscription);
router.get('/', protect, listSubscriptions);

module.exports = router; 