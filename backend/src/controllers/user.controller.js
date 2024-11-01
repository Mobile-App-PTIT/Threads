const User = require("../models/user.model");
const Reply = require("../models/reply.model");
const redisClient = require("../configs/redis");

const updateUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { subname, name, bio, image } = req.body;
    const user = await User.findByIdAndUpdate(
      {
        _id: user_id,
      },
      {
        name,
        bio,
        subname,
        image,
      },
      { new: true }
    );

    await redisClient.set(`user:${user_id}`, JSON.stringify(user));

    res.status(200).json({
      message: "User info updated successfully",
      metadata: user,
    });
  } catch (err) {
    next(err);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    // Check if user data is cached in Redis
    const cachedUser = await redisClient.get(`user:${user_id}`);
    if (cachedUser) {
      return res.status(200).json({
        message: "User info fetched successfully (from cache)",
        metadata: JSON.parse(cachedUser),
      });
    }

    const user = await User.findById({
      _id: user_id,
    })
    .select("-password -username -createdAt -updatedAt -__v")
    .lean();

    // Cache the user data in Redis
    await redisClient.set(`user:${user_id}`, JSON.stringify(user));

    res.status(200).json({
      message: "User info fetched successfully",
      metadata: user,
    });
  } catch (err) {
    next(err);
  }
};

const getAllUserInfo = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -username -createdAt -updatedAt -__v")
      .lean();

    res.status(200).json({
      message: "All users info fetched successfully",
      metadata: users,
    });
  } catch (err) {
    next(err);
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    if(user_id !== req.params.user_id) {
      return res.status(403).json({
        message: "You are not authorized to delete this user",
      });
    }

    await User.findByIdAndDelete(user_id);

    // Remove user data from Redis cache
    await redisClient.del(`user:${user_id}`);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getUserReplied = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    const replies = await Reply.find({
      user_id,
    }).populate({
      'path': 'post_id',
    }).lean();

    res.status(200).json({
      message: "User replies fetched successfully",
      metadata: replies,
    });
  } catch (err) {
    next(err);
  } 
}

const getUserFollowers = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById({
      _id: user_id,
    })
      .select("followers")
      .populate("followers", "name image");

    const totalFollowers = user.followers.length;

    res.status(200).json({
      totalFollowers,
      followers: user.followers,
    });
  } catch (err) {
    next(err);
  }
};

const getUserFollowing = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById({
      _id: user_id,
    })
      .select("following")
      .populate("following", "name image");

    const totalFollowing = user.following.length;

    res.status(200).json({
      totalFollowing,
      following: user.following,
    });
  } catch (err) {
    next(err);
  }
};

const FollowOrUnfollowUser = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { follower_id } = req.params;

    const checkFollow = await User.findOne({
      _id: user_id,
      following: follower_id,
    })

    if(checkFollow) {
      res.status(200).json({
        message: "User already followed",
      });
    }

    await User.findByIdAndUpdate({
      _id: user_id,
    }, {
      $addToSet: { following: follower_id },
    }, {
      new: true,
    })

    await User.findByIdAndUpdate({
      _id: follower_id,
    }, {
      $addToSet: { followers: user_id },
    }, {
      new: true,
    })

    res.status(200).json({
      message: "Follow/Unfollow successful",
    });
  } catch(err) {
    next(err);
  }
}

module.exports = {
  updateUserInfo,
  getUserInfo,
  getAllUserInfo,
  deleteUser,
  getUserReplied,
  getUserFollowers,
  getUserFollowing,
  FollowOrUnfollowUser
};
