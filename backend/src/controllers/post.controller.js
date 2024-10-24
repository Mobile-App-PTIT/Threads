const Post = require('../models/post.model');
const Reply = require('../models/reply.model');
const { uploadImage, deleteImage } = require('../configs/cloudinary');
const redisClient = require('../configs/redis');

// Post 
const createPost = async (req, res, next) => {
    try {
        const user_id = req.userId;
        const { title } = req.body;
        const imageFiles = req.files;

        console.log(title, imageFiles);
        
        const uploadedImages = await Promise.all(
            imageFiles.map(async (file) => {
              const imageBuffer = file.buffer.toString('base64');
              const imageData = `data:image/jpeg;base64,${imageBuffer}`;
              return await uploadImage(imageData);
            })
        );
        const newPost = await Post.create({
            title,
            image: uploadedImages,
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

        const cachedPost = await redisClient.get(`post:${post_id}`);
        if (cachedPost) {
            return res.status(200).json({
                message: "Post fetched successfully (from cache)",
                metadata: JSON.parse(cachedPost),
            });
        }

        const post = await Post.findById({
            _id: post_id,
        })
        .populate({
            'path': 'replies',
            populate: {
                'path': 'replies',
            }
        });

        await redisClient.set(`post:${post_id}`, JSON.stringify(post));

        res.status(200).json({
            message: "Post fetched successfully",
            metadata: post,
        });
    } catch(err) {
        next(err);
    }
}

const getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "All posts fetched successfully",
            metadata: posts,
        });
    } catch(err) {
        next(err);
    }
}

const updatePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const { title, image, status } = req.body;
        if (!title || !image || !status) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const checkPost = await Post.findById({
            _id: post_id,
        });
        if(checkPost.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this post",
            });
        }

        const post = await Post.findByIdAndUpdate(
            {
                _id: post_id,
            },
            {
                title,
                image,
                status,
            },
            { new: true }
        );

        await redisClient.set(`post:${post_id}`, JSON.stringify(post));

        res.status(200).json({
            message: "Post updated successfully",
            metadata: post,
        });
    } catch(err) {
        next(err);
    }
}

const deletePost = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const post = await Post.findByIdAndDelete({
            _id: post_id,
        });

        await Reply.deleteMany({
            post_id,
        });

        await deleteImage(post.image);
        await redisClient.del(`post:${post_id}`);

        res.status(200).json({
            message: "Post deleted successfully",
        });
    } catch(err) {
        next(err);
    }
}

// Reply to a post
const getPostReplies = async (req, res, next) => {
    try {
        const { reply_id } = req.params;

        const replies = await Reply.findById({
            _id: reply_id,
        }).populate({
            'path': 'replies',
        }).lean();

        res.status.json({
            message: "Replies fetched successfully",
            metadata: replies,
        });
    } catch(err) {
        next(err);
    }
}

const createReply = async (req, res, next) => {
    try {
        const user_id  = req.user._id;
        const { post_id } = req.params;
        const { title, image } = req.body;
        if (!reply) {
            return res.status(400).json({
                message: "Reply field is required",
            });
        }

        const reply = await Reply.create({
            post_id,
            title: title,
            user_id,
            image,
        })

        await Post.findByIdAndUpdate(
            {
                _id: post_id,
            },
            {
                $push: {
                    replies: reply._id,
                }
            }
        )

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
        const { title, image } = req.body;
        const checkUser = await Reply.findById({
            _id: reply_id,
        });

        if (checkUser.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this reply",
            });
        }

        const reply = await Reply.findByIdAndUpdate(
            {
                _id: reply_id,
            },
            {
                title,
                image,
            },
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
    try {
        const { reply_id } = req.params;
        const reply = await Reply.findByIdAndDelete({
            _id: reply_id,
        });

        await Post.findByIdAndUpdate(
            {
                _id: reply.post_id,
            },
            {
                $pull: {
                    replies: reply_id,
                }
            }
        );

        await deleteImage(reply.image);

        res.status(200).json({
            message: "Reply deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createPost,
    getPost,
    getAllPosts,
    updatePost,
    deletePost,

    getPostReplies,
    createReply,
    updateReply,
    deleteReply,
}