const express = require('express');
const router = express.Router();
const {
  listPlans,
  createSubscription,
  listSubscriptions,
  initializePayment, // <-- New
  paystackWebhook,   // <-- New
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', listPlans);
router.get('/', protect, listSubscriptions);

// New routes
router.post('/initialize', protect, initializePayment); 
router.post('/webhook', paystackWebhook); // Note: No 'protect' here. Paystack can't send JWT tokens!

module.exports = router;