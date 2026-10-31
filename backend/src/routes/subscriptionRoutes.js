const express = require('express');
const router = express.Router();
const { 
  listPlans, 
  initializePayment, 
  paystackWebhook, 
  getMySubscription, 
  cancelSubscription 
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', listPlans);
router.post('/initialize', protect, initializePayment);
router.post('/webhook', paystackWebhook);

// Billing Portal Routes
router.get('/my-plan', protect, getMySubscription);
router.post('/cancel', protect, cancelSubscription);