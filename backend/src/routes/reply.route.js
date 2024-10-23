const express = require('express');
const { upload } = require('../configs/cloudinary')
const replyController = require('../controllers/reply.controller');

const router = express.Router();

// Reply to a reply
router.post('/:post_id', upload.single('image'), replyController.createReplyToReply);
router.get('/:reply_id', replyController.getRepliesOfReply);

module.exports = router;