const Post = require('../models/post.model');
const Reply = require('../models/reply.model');

const createPost = async (req, res, next) => {
    try {
        const user_id = req.user._id;
        const { title, image, status } = req.body;
        if (!title || !image || !status) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const post = await Post.create({
            title,
            image,
            status,
            user_id,
        });

        res.status(201).json({
            message: "Post created successfully",
            metadata: post,
        });
    } catch(err) {
        next(err);
    }
}

const getPost = async (req, res, next) => {
    try {
        const { post_id } = req.params;

        const post = await Post.findById({
            _id: post_id,
        })
        .populate({
            'path': 'replies',
            populate: {
                'path': 'replies',
            }
        });

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
        const posts = await Post.find().orderBy({ createdAt: 1 });

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
        await Post.findByIdAndDelete({
            _id: post_id,
        });

        await Reply.deleteMany({
            post_id,
        });

        res.status(200).json({
            message: "Post deleted successfully",
        });
    } catch(err) {
        next(err);
    }
}

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

module.exports = {
    createPost,
    getPost,
    getAllPosts,
    updatePost,
    deletePost,
    getPostReplies,
}