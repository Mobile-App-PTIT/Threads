const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/:userId", userController.getUserInfo);
router.get("/", userController.getAllUserInfo);
router.patch("/:userId", userController.updateUserInfo);
router.delete("/:userId", userController.deleteUser);

router.get("/followers/:userId", userController.getUserFollowers);
router.get("/following/:userId", userController.getUserFollowing);

module.exports = router;