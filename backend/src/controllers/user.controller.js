const User = require("../models/user.model");
const Reply = require("../models/reply.model");

const updateUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { name, bio, email, image } = req.body;
    if (!name || !bio || !email || !image) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      {
        _id: user_id,
      },
      {
        name,
        bio,
        email,
        image,
      },
      { new: true }
    );

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

    const user = await User.findById({
      _id: user_id,
    })
      .select("-password -username -createdAt -updatedAt -__v")
      .lean();

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

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getUserReply = async (req, res, next) => {
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

module.exports = {
  updateUserInfo,
  getUserInfo,
  getAllUserInfo,
  deleteUser,
  getUserFollowers,
  getUserFollowing,
};
