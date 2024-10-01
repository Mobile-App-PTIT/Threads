const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/:user_id", userController.getUserInfo);
router.get("/", userController.getAllUserInfo);
router.patch("/:user_id", userController.updateUserInfo);
router.delete("/:user_id", userController.deleteUser);

router.get("/followers/:user_id", userController.getUserFollowers);
router.get("/following/:user_id", userController.getUserFollowing);

module.exports = router;