const express = require('express');
const router = express.Router();
const { listMessages, sendMessage, markRead } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/', protect, listMessages);
router.post('/', protect, sendMessage);
router.put('/:id/read', protect, markRead);

module.exports = router;