const express = require('express');
const authController = require('../controllers/auth.controller');

let router = express.Router();

let initWebRoutes = (app) => {
  router.post('/signup', authController.signup);
  router.post('/login', authController.login);
  router.post('/refresh-token', authController.refresh);

  return app.use('/api', router);
};

module.exports = initWebRoutes;
