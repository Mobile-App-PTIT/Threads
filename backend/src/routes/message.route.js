const express = require('express');
const messageController = require('../controllers/message.controller');
const {isAuth} = require('../middleware/privilege');

const router = express.Router();

router.post('/update-seen-status/:otherUserId', isAuth, messageController.updateSeenStatus);
router.get('/get-messages-by-user-ids/:otherUserId', isAuth, messageController.getMessagesByUserIds);
router.post('/join-call', isAuth, messageController.joinCall);

module.exports = router;