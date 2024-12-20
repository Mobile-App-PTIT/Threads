const express = require('express');
const userController = require('../controllers/user.controller');
const { upload } = require('../configs/cloudinary');
const { isAuth } = require('../middleware/privilege');

const router = express.Router();

router.get('/:user_id', userController.getUserInfo);
router.get('/', userController.getAllUserInfo);
router.patch('/:user_id', isAuth, upload.single('avatar'), userController.updateUserInfo);
router.delete('/:user_id', isAuth, userController.deleteUser);

// Followers and Following
router.get('/replied/:user_id', userController.getUserReplied);
router.get('/followers/:user_id', userController.getUserFollowers);
router.get('/following/:user_id', userController.getUserFollowing);
router.patch('/follow/:follower_id', isAuth, userController.FollowOrUnfollowUser);

module.exports = router;