const Post = require('../models/post.model');
const Reply = require('../models/reply.model');
const { uploadImage, deleteImage } = require('../configs/cloudinary');
const redisClient = require('../configs/redis');

const createReplyToReply = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const { post_id } = req.params;
        const { title, image} = req.body;

        if(image) {
            const cloudImage = await uploadImage(image, 'replies');
            const reply = await Reply.create({
                title,
                image: cloudImage,
                post_id,
                user_id,
            }, {
                $push: {
                    replies: reply._id,
                }
            });
        }

        const reply = await Reply.create({
            title,
            post_id,
            user_id,
        }, {
            $push: {
                replies: reply._id,
            }
        })

        res.status(201).json({
            message: "Reply created successfully",
            metadata: reply,
        });
    } catch(err) {
        next(err);
    }
}

module.exports = {
    createReplyToReply,
}