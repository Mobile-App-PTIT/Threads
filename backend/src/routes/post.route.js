const express = require('express');
const postController = require('../controllers/post.controller');

const router = express.Router();

router.get('/reply/:reply_id', postController.getPostReplies);
router.get('/:post_id', postController.getPostReplies);
router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);
router.patch('/:post_id', postController.updatePost);
router.delete('/:post_id', postController.deletePost);

module.exports = router;