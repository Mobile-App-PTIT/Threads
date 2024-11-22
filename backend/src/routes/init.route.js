const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const postRoutes = require('./post.route');
const replyRoutes = require('./reply.route');
const messageRoutes = require('./message.route');
const notificationRoutes = require('./notification.route');

let router = express.Router();

let initWebRoutes = (app) => {
  router.use('/user', userRoutes);
  router.use('/auth', authRoutes);
  router.use('/message', messageRoutes);
  router.use('/post', postRoutes);
  router.use('/reply', replyRoutes);
  router.use('/notification', notificationRoutes);

  return app.use('/api', router);
};

module.exports = initWebRoutes;
