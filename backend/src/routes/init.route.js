const express = require("express");
const userRoutes = require("./user.route");
const authRoutes = require("./auth.route");

let router = express.Router();

let initWebRoutes = (app) => {
  router.use("/user", userRoutes);
  router.use("/auth", authRoutes);

  return app.use("/api", router);
};

module.exports = initWebRoutes;
