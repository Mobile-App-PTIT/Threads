const express = require("express");
const userRoutes = require("./user");

let router = express.Router();

let initWebRoutes = (app) => {
  router.use("/user", userRoutes);

  return app.use("/", router);
};

module.exports = initWebRoutes;
