const Reply = require('../models/reply.model');
const Post = require('../models/post.model');
const { uploadMedia, deleteMedia } = require('../configs/cloudinary');
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

        let reply = await Reply.create(replyData);

        reply = await Reply.findById(reply._id).populate('user_id', '-password -gmail').lean();

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
        }).sort({ createdAt: -1 }).lean();

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

const deleteReply = async (req, res, next) => {
    try {
        const { reply_id } = req.params;

        // Delete reply and nested replies
        await deleteReplyAndNested(reply_id);

        await Post.updateOne({
            replies: reply_id,
        }, {
            $pull: {
                replies: reply_id,
            }
        })

        await Reply.updateMany({
            replies: reply_id,
        }, {
            $pull: {
                replies: reply_id,
            }
        })

        res.status(200).json({
            message: "Reply deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

const deleteReplyAndNested = async (reply_id) => {
    const reply = await Reply.findById(reply_id);
    if (!reply) return;

    // Recursively delete nested replies
    if (reply.replies && reply.replies.length > 0) {
        await Promise.all(
            reply.replies.map(async (nestedReply) => {
                await deleteReplyAndNested(nestedReply);
            })
        );
    }

    // Delete associated media if any
    if (reply.media && reply.media.length > 0) {
        await Promise.all(
            reply.media.map(async (mediaUrl) => {
                await deleteMedia(mediaUrl); 
            })
        );
    }

    // Delete the reply itself
    await Reply.deleteOne({ _id: reply_id });
};


module.exports = {
    createReplyToReply,
    getRepliesOfReply,
    likeOrUnlikeReplies,
    deleteReply,
}