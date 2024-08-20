const express = require("express");
const userRoutes = require("./user.route");

let router = express.Router();

let initWebRoutes = (app) => {
  router.use("/user", userRoutes);

  return app.use("/api", router);
};

module.exports = initWebRoutes;
