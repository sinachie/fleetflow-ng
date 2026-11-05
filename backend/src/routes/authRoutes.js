const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  me, 
  generateApiKey, 
  updateErpUrl, 
  getTeam, 
  createTeamMember 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { checkPlan } = require('../middleware/checkplan');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

// Enterprise Routes
router.post('/generate-api-key', protect, checkPlan(['enterprise']), generateApiKey);
router.put('/erp-url', protect, checkPlan(['enterprise']), updateErpUrl);

// Team Routes (Only Admins can manage team)
router.get('/team', protect, authorize('admin'), getTeam);
router.post('/team', protect, authorize('admin'), createTeamMember);

module.exports = router;