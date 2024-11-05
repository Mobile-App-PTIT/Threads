const express = require('express');
const { upload } = require('../configs/cloudinary')
const { isAuth } = require("../middleware/privilege");
const postController = require('../controllers/post.controller');

const router = express.Router();

//Post
router.get('/:post_id', postController.getPost);
router.get('/', postController.getAllPosts);
router.get('/user/:user_id', postController.getAllUserCreatePost)
router.post('/', isAuth, upload.array('mediaFiles'), postController.createPost);
router.patch('/:post_id', isAuth, postController.updatePost);
router.delete('/:post_id', isAuth, postController.deletePost);

//Like a post
router.patch('/:post_id/like', isAuth, postController.likeOrUnlikePost);

//Share a post
router.patch('/:post_id/share', isAuth, postController.sharePost);
router.get('/share/:user_id', postController.getUserSharePosts);

//Reply to a post
router.post('/:post_id/reply', isAuth, upload.array('mediaFiles'), postController.createReply);
router.patch('/:post_id/reply/:reply_id', isAuth, postController.updateReply);
router.delete('/:post_id/reply/:reply_id', isAuth, postController.deleteReply);

module.exports = router;