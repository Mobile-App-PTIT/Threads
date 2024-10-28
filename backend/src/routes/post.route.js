const express = require('express');
const { upload } = require('../configs/cloudinary')
const { isAuth } = require("../middleware/privilege");
const postController = require('../controllers/post.controller');

const router = express.Router();

//Post
router.get('/reply/:reply_id', postController.getPostReplies);
router.get('/:post_id', postController.getPostReplies);
router.get('/', postController.getAllPosts);
router.post('/', isAuth, upload.array('images'), postController.createPost);
router.patch('/:post_id', postController.updatePost);
router.delete('/:post_id', postController.deletePost);

//Like a post
router.patch('/:post_id/like', postController.likeOrUnlikePost);

//Reply to a post
router.post('/:post_id/reply', postController.createReply);
router.patch('/:post_id/reply/:reply_id', postController.updateReply);
router.delete('/:post_id/reply/:reply_id', postController.deleteReply);

module.exports = router;