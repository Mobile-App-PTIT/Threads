const express = require("express");
const userRoutes = require("./user.route");
const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");
const replyRoutes = require("./reply.route");

let router = express.Router();

let initWebRoutes = (app) => {
  router.use("/user", userRoutes);
  router.use("/auth", authRoutes);
  router.use("/post", postRoutes);
  router.use("/reply", replyRoutes);

  return app.use("/api", router);
};

module.exports = initWebRoutes;
