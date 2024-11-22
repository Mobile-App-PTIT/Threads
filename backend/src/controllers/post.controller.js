const Post = require('../models/post.model');
const Reply = require('../models/reply.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');
const { uploadMedia, deleteMedia } = require('../configs/cloudinary');
const redisClient = require('../configs/redis');

// Post 
const createPost = async (req, res, next) => {
    try {
        const user_id = req.userId;
        const { title } = req.body;
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
        
        const newPost = await Post.create({
            title,
            media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
            user_id,
        });

        res.status(201).json({
            message: "Post created successfully",
            metadata: newPost,
        });
    } catch(err) {
        next(err);
    }
}

const getPost = async (req, res, next) => {
    try {
        const { post_id } = req.params;

        const post = await Post.findById(post_id)
            .populate({
                path: 'replies',
                populate: {
                    path: 'user_id',
                    select: '-password -gmail',
                }
            })
            .populate({
                path: 'user_id',
                select: '-password -email',
            });
        
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        res.status(200).json({
            message: "Post fetched successfully",
            metadata: post,
        });
    } catch(err) {
        next(err);
    }
}

const getAllUserCreatePost = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        if(!user_id) return res.status(400).json({ message: "User id is required" });

        const allPosts = await Post.find({ status: 'public' })
            .populate({
                'path': 'user_id',
                'select': '-password -email',
            })
            .lean();
        const matchingPosts = allPosts.filter(post => post.user_id._id.toString() === user_id);

        res.status(200).json({
            message: "All user create posts fetched successfully",
            metadata: matchingPosts,
        });
    } catch (err) {
      next(err);
    }
}

const getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate({
                path: 'user_id',
                select: '-password -email' 
            })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            message: "All posts fetched successfully",
            metadata: posts,
        });
    } catch (err) {
        next(err);
    }
};

const updatePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { title, media, status } = req.body;

        const checkPost = await Post.findById({ _id: post_id });
        if (checkPost.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this post",
            });
        }

        const post = await Post.findByIdAndUpdate(
            { _id: post_id },
            { title, media, status },
            { new: true }
        );

        res.status(200).json({
            message: "Post updated successfully",
            metadata: post,
        });
    } catch(err) {
        next(err);
    }
}

const deletePost = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { post_id } = req.params;
        const post = await Post.findByIdAndDelete({ _id: post_id }).session(session);
        await User.updateMany({
            share: { $elemMatch: { post_id } }
        }, {
            $pull: { share: { post_id } }
        }).session(session);
        await Reply.deleteMany({ post_id }).session(session);
        await deleteMedia(post.media).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: "Post deleted successfully",
        });
    } catch(err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

// Like a post
const likeOrUnlikePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const user_id = req.userId;

        const post = await Post.findById({ _id: post_id });
        if(!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const hasLiked = post.likes.includes(user_id);
        if(hasLiked) {
            await Post.updateOne({ _id: post_id }, { $pull: { likes: user_id } });
        } else {
            await Post.updateOne({ _id: post_id }, { $addToSet: { likes: user_id } });
        }

        // Notify the post owner about the like/unlike
        await notifyPostOwner({ post_id, type: hasLiked ? "unlike" : "like" });

        res.status(200).json({
            message: "Post liked/unliked successfully",
        });
    } catch (err) {
        next(err);
    }
}

// Share a post
const sharePost = async (req, res, next) => {
    try {
        const user_id = req.userId;
        const { post_id } = req.params

        await User.findByIdAndUpdate({
            _id: user_id
        }, {
            $addToSet: { share: { post_id } }
        })

        res.status(200).json({
            message: "Share successful"
        })
    } catch(err) {
        next(err);
    }
}

const getUserSharePosts = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        let sharePosts = [];
        if(user_id == req.userId) {
            sharePosts = await User.findById(user_id)
                .populate({
                    'path': 'share.post_id',
                    'select': '-password -email',
                    'populate': {
                        'path': 'user_id',
                        'select': '-password -email',
                    }
                })
        } else {
            sharePosts = await User.findById({
                _id: user_id,
                share: { $elemMatch: { status: 'public' } }
            }).populate({
                'path': 'share.post_id',
                'select': '-password -email',
                'populate': {
                    'path': 'user_id',
                    'select': '-password -email',
                }
            })
        }
        
        res.status(200).json({
            message: "User share posts fetched successfully",
            metadata: sharePosts.share,
        });
    } catch(err) {
        next(err);
    }
}

const publicOrPrivateSharePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { status } = req.body;
        const user_id = req.userId;

        const checkPost = await Post.findById({ _id: post_id });
        if(!checkPost) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        await User.updateOne({
            _id: user_id,
            'share.post_id': post_id,
        }, {
            $set: {
                'share.$.status': status,
            }
        })

        res.status(200).json({
            message: "Update share post status successfully ",
        });
    } catch(err) {
        next(err);
    }
}

// Reply to a post
const createReply = async (req, res, next) => {
    try {
        const user_id = req.userId;
        const { post_id } = req.params;
        const { title } = req.body;
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

        const reply = await Reply.create({
            post_id,
            title,
            user_id,
            media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
        });

        await Post.findByIdAndUpdate(
            { _id: post_id },
            { $push: { replies: reply._id } }
        );

        // Notify the post owner about the new reply
        await notifyPostOwner({ post_id, type: "comment" });

        res.status(201).json({
            message: "Reply created successfully",
            metadata: reply,
        });
    } catch (err) {
        next(err);
    }
}

const updateReply = async (req, res, next) => {
    try {
        const { reply_id } = req.params;
        const { title, media } = req.body;
        const checkUser = await Reply.findById({ _id: reply_id });

        if (checkUser.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this reply",
            });
        }

        const reply = await Reply.findByIdAndUpdate(
            { _id: reply_id },
            { title, media },
            { new: true }
        );

        res.status(200).json({
            message: "Reply updated successfully",
            metadata: reply,
        });
    } catch (err) {
        next(err);
    }
}

const deleteReply = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { reply_id } = req.params;

        await deleteReplyAndNested(reply_id, session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ 
            message: "Reply deleted successfully",
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}

const deleteReplyAndNested = async (reply_id, session) => {
    const reply = await Reply.findById(reply_id).session(session);
    if(!reply) return;

    if(reply.replies && reply.replies.length > 0) {
        await Promise.all(
            reply.replies.map(async (nestedReply) => {
                await deleteReplyAndNested(nestedReply, session);
            })
        );
    }

    if(reply.media && reply.media.length > 0) {
        await Promise.all(
            reply.media.map(async (mediaUrl) => {
                await deleteMedia([mediaUrl]);
            }
        ));
    }

    await Reply.deleteOne({ _id: reply_id }).session(session);
}

// Notification
const notifyPostOwner = async ({ post_id, type }) => {
    try {
        const post = await Post.findById(post_id);
        if (!post) throw new Error("Post not found");

        const ownerId = post.user_id;

        const notificationData = {
            user_id: ownerId,
            post_id,
            type,
            message:`Someone ${type} on your post.`,
        }

        // Save notification to database
        await Notification.create(notificationData);

        // Save notification to redis
        await redisClient.publish(`notifications:${ownerId}`, JSON.stringify(notificationData));
    } catch(err) {
        console.error("Error in createNotification:", err);
    }
}

module.exports = {
    createPost,
    getPost,
    getAllPosts,
    getAllUserCreatePost,
    getUserSharePosts,
    updatePost,
    deletePost,
    likeOrUnlikePost,
    sharePost,
    publicOrPrivateSharePost,
    createReply,
    updateReply,
    deleteReply,
}
