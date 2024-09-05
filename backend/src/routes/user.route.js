const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/", userController.getUserInfo);
router.patch("/", userController.updateUserInfo);
router.delete("/", userController.deleteUser);

router.get("/followers/:userId", userController.getUserFollowers);
router.get("/following/:userId", userController.getUserFollowing);

module.exports = router;