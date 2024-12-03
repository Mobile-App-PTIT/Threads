const express = require('express');
const authController = require('../controllers/auth.controller');
const {isAuth} = require("../middleware/privilege");

let authRoutes = (chatClient) => {
    const router = express.Router();

    router.post('/signup', (req, res, next) => {
        authController.signup(req, res, next, chatClient);
    });
    router.post('/login', (req, res, next) => {
        authController.login(req, res, next, chatClient);
    });
    router.post('/refresh-token', authController.refresh);
    router.post('/fcm-token', isAuth, authController.postFcmToken);
    router.get('/fcm-token', isAuth, authController.getFcmToken);

    return router;
}

module.exports = authRoutes;
