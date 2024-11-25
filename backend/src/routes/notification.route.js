const express = require('express');
const { isAuth } = require('../middleware/privilege');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/user/:user_id/replied', isAuth, notificationController.getUserRepliedNotification);
router.get('/', isAuth, notificationController.getAllNotifications);

module.exports = router;

