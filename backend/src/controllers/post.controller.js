const Post = require('../models/post.model');
const Reply = require('../models/reply.model');
const User = require('../models/user.model');
const { uploadImage, deleteImage } = require('../configs/cloudinary');
const redisClient = require('../configs/redis');

// Post 
const createPost = async (req, res, next) => {
    try {
        const user_id = req.userId;
        const { title } = req.body;
        const imageFiles = req.files;

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

        // Set new post in Redis cache
        await redisClient.set(`post:${newPost._id}`, JSON.stringify(newPost), { EX: 60 });

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

        await redisClient.set(`post:${post_id}`, JSON.stringify(post), { EX: 60 });

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
  
      const posts = await Post.find({
        user_id,
      }).sort({ createdAt : -1 }).lean();

      res.status(200).json({
        message: "Post fetched successfully",
        metadata: posts,
      })
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
        const { title, image, status } = req.body;

        const checkPost = await Post.findById({ _id: post_id });
        if (checkPost.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this post",
            });
        }

        const post = await Post.findByIdAndUpdate(
            { _id: post_id },
            { title, image, status },
            { new: true }
        );

        // Update the cache with the new post data
        await redisClient.set(`post:${post_id}`, JSON.stringify(post), { EX: 60 });

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
        const post = await Post.findByIdAndDelete({ _id: post_id });

        await Reply.deleteMany({ post_id });
        await deleteImage(post.image);

        // Delete the post from Redis cache
        await redisClient.del(`post:${post_id}`);

        res.status(200).json({
            message: "Post deleted successfully",
        });
    } catch(err) {
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

        // Invalidate the cached post to reflect the new like/unlike status
        await redisClient.del(`post:${post_id}`);

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
            $addToSet: { share: post_id }
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

        const sharePosts = await User.findById(user_id)
            .populate({
                'path': 'share',
                'select': '-password -email',
                'populate': {
                    'path': 'user_id',
                    'select': '-password -email',
                }
            })
        
        res.status(200).json({
            message: "User share posts fetched successfully",
            metadata: sharePosts.share,
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
        const { title, image } = req.body;

        const reply = await Reply.create({
            post_id,
            title,
            user_id,
            image,
        });

        await Post.findByIdAndUpdate(
            { _id: post_id },
            { $push: { replies: reply._id } }
        );

        // Invalidate cache as new reply is added
        await redisClient.del(`post:${post_id}`);

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
        const checkUser = await Reply.findById({ _id: reply_id });

        if (checkUser.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this reply",
            });
        }

        const reply = await Reply.findByIdAndUpdate(
            { _id: reply_id },
            { title, image },
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
        const reply = await Reply.findByIdAndDelete({ _id: reply_id });

        await Post.findByIdAndUpdate(
            { _id: reply.post_id },
            { $pull: { replies: reply_id } }
        );

        await deleteImage(reply.image);

        // Invalidate cache for the post associated with the deleted reply
        await redisClient.del(`post:${reply.post_id}`);

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
    getAllUserCreatePost,
    getUserSharePosts,
    updatePost,
    deletePost,
    likeOrUnlikePost,
    sharePost,
    createReply,
    updateReply,
    deleteReply,
}
