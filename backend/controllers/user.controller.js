const User = require('../models/user.model');

exports.updateUserInfo = async (req, res, next) => {
    try {
        const { name, bio, email, image } = req.body;
        if(!name || !bio || !email || !image) {
            return res.status(400).json({
                message: "All fields are required",
            })
        }

        const user = await User.findByIdAndUpdate({
            _id: req.user._id
        }, {
            name, 
            bio,
            email,
            image,
        }, { new: true});

        res.status(200).json({
            message: "User info updated successfully",
            user,
        });
    } catch(err) {
        next(err);
    }
}

exports.getUserInfo = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById({
            _id: userId
        })
        .select("-password -username -createdAt -updatedAt -__v")
        .lean();

        res.status(200).json({
            user
        })
    } catch(err) {
        next(err);
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.user._id;

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "User deleted successfully",
        })
    } catch(err) {
        next(err);
    }
}

exports.getUserFollowers = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById({
            _id: userId
        })
        .select("followers")
        .populate("followers", "name image");

        const totalFollowers = user.followers.length;

        res.status(200).json({
            totalFollowers,
            followers: user.followers,
        })
    } catch(err) {
        next(err);
    }
}

exports.getUserFollowing = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById({
            _id: userId,
        })
        .select("following")
        .populate("following", "name image");

        const totalFollowing = user.following.length;

        res.status(200).json({
            totalFollowing,
            following: user.following,
        })
    } catch(err) {
        next(err);
    }
}

