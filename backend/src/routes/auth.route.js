const express = require('express');
const authController = require('../controllers/auth.controller');
const {isAuth} = require("../middleware/privilege");

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/fcm-token', isAuth, authController.postFcmToken);
router.get('/fcm-token', isAuth, authController.getFcmToken);

module.exports = router;
