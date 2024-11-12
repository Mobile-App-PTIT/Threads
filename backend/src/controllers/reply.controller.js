const Reply = require('../models/reply.model');
const { uploadMedia } = require('../configs/cloudinary');
// const redisClient = require('../configs/redis');

const createReplyToReply = async (req, res, next) => {
    try {
        const user_id = req.userId;
        const { reply_id } = req.params;
        const { title, post_id } = req.body;
        const mediaFiles = req.files || [];

        let uploadedMedia = [];

        if (mediaFiles.length > 0) {
            uploadedMedia = await Promise.all(
                mediaFiles.map(async (file) => {
                    let resourceType = 'image';
                    if (file.mimetype.startsWith("video/")) resourceType = 'video';
                    else if (file.mimetype.startsWith("audio/")) resourceType = 'audio';

                    const fileBuffer = file.buffer.toString('base64');
                    const fileData = `data:${file.mimetype};base64,${fileBuffer}`;
                    return await uploadMedia(fileData, resourceType);
                })
            );
        }

        const replyData = {
            title,
            post_id,
            user_id,
            media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
        };

        const reply = await Reply.create(replyData);

        await Reply.updateOne(
            { _id: reply_id },
            { $push: { replies: reply._id } }
        );

        res.status(201).json({
            message: "Reply created successfully",
            metadata: reply,
        });
    } catch (err) {
        console.error("Error in createReply:", err);
        next(err);
    }
}

const getRepliesOfReply = async (req, res, next) => {
    try {
        const { reply_id } = req.params;

        const replies = await Reply.findById({
            _id: reply_id,
        }).populate({
            'path': 'replies',            
            'populate': {
                'path': 'user_id',
                'select': '-password -gmail',
            }
        }).populate({
            'path': 'user_id',
            'select': '-password -gmail',
        }).lean();
        console.log(replies.replies);

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