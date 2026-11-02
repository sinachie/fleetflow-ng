const express = require('express');
const router = express.Router();
const { register, login, me, generateApiKey, updateErpUrl } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { checkPlan } = require('../middleware/checkPlan');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/generate-api-key', protect, checkPlan(['enterprise']), generateApiKey);
router.put('/erp-url', protect, checkPlan(['enterprise']), updateErpUrl);

module.exports = router;