const Reply = require('../models/reply.model');
const { uploadImage } = require('../configs/cloudinary');
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

const getRepliesOfReply = async (req, res, next) => {
    try {
        const { reply_id } = req.params;

        const replies = await Reply.find({
            replies: reply_id,
        }).populate({
            'path': 'replies',            
            'select': 'title image likes',
        }).populate({
            'path': 'user_id',
        }).lean();

        await redisClient.set(`reply:${reply_id}`, JSON.stringify(replies));
        res.status(200).json({
            message: "Replies fetched successfully",
            metadata: replies,
        });
    } catch(err) {
        next(err);
    }
}

const likeOrUnlikeReplies = async (req, res, next) => {
    try {
        const { reply_id } = req.params;
        const user_id = req.userId;

        const checkLike = await Reply.findOne({
            _id: reply_id,
        })

        if(checkLike.likes.includes(user_id)) {
            await Reply.updateOne({
                _id: reply_id,
            }, {
                $pull: {
                    likes: user_id,
                }
            })
        } else {
            await Reply.updateOne({
                _id: reply_id,
            }, {
                $push: {
                    likes: user_id,
                }
            })
        }

        res.status(200).json({
            message: "Reply liked/unliked successfully",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createReplyToReply,
    getRepliesOfReply,
    likeOrUnlikeReplies,
}