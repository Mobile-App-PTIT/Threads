const express = require('express');
// const { upload } = require('../configs/cloudinary')
const { isAuth } = require('../middleware/privilege');
const replyController = require('../controllers/reply.controller');

const router = express.Router();

// Reply to a reply
router.post('/:reply_id', isAuth, replyController.createReplyToReply);
router.get('/:reply_id', replyController.getRepliesOfReply);
router.patch('/:reply_id/like', isAuth, replyController.likeOrUnlikeReplies);

module.exports = router;