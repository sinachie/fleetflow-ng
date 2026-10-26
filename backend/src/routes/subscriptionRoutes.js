const express = require('express');
const router = express.Router();
const {
  listPlans,
  createSubscription,
  listSubscriptions,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', listPlans);
router.get('/', protect, listSubscriptions);
router.post('/', protect, createSubscription);

module.exports = router;