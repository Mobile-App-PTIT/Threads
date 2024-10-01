const express = require("express");
const userRoutes = require("./user.route");
const authRoutes = require("./auth.route");
const postRoutes = require("./post.route");

let router = express.Router();

let initWebRoutes = (app) => {
  router.use("/user", userRoutes);
  router.use("/auth", authRoutes);
  router.use("/post", postRoutes);

  return app.use("/api", router);
};

module.exports = initWebRoutes;
