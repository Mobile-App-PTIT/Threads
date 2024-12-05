const User = require('../models/user.model');
const Reply = require('../models/reply.model');
const { uploadMedia } = require('../configs/cloudinary');
const redisClient = require('../configs/redis');

const invalidateUserCache = async (user_id) => {
  await redisClient.del(`user:${user_id}`);
  await redisClient.del('users:all');
};

const updateUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { subname, name, bio } = req.body;
    const avatar = req.file;

    const updateFields = { name, bio, subname };

    if (avatar) {
      const fileBuffer = avatar.buffer.toString('base64');
      const fileData = `data:${avatar.mimetype};base64,${fileBuffer}`;
      const image = await uploadMedia(fileData);
      updateFields.avatar = image;
    }

    const user = await User.findByIdAndUpdate(user_id, updateFields, { new: true })
      .select('-password -username -createdAt -updatedAt -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the cache
    await redisClient.set(`user:${user_id}`, JSON.stringify(user), { EX: 300 });
    await redisClient.del('users:all'); // Invalidate the users list cache

    res.status(200).json({
      message: 'User info updated successfully',
      metadata: user,
    });
  } catch (err) {
    next(err);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const cachedUser = await redisClient.get(`user:${user_id}`);
    if (cachedUser) {
      return res.status(200).json({
        message: 'User info fetched successfully (from cache)',
        metadata: JSON.parse(cachedUser),
      });
    }

    const user = await User.findById(user_id)
      .select('-password -username -createdAt -updatedAt -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await redisClient.set(`user:${user_id}`, JSON.stringify(user), { EX: 300 });

    res.status(200).json({
      message: 'User info fetched successfully',
      metadata: user,
    });
  } catch (err) {
    next(err);
  }
};

const getAllUserInfo = async (req, res, next) => {
  try {
    const cachedUsers = await redisClient.get('users:all');
    if (cachedUsers) {
      return res.status(200).json({
        message: 'All users info fetched successfully (from cache)',
        metadata: JSON.parse(cachedUsers),
      });
    }

    const users = await User.find()
      .select('-password -username -createdAt -updatedAt -__v')
      .lean();

    await redisClient.set('users:all', JSON.stringify(users), { EX: 300 });

    res.status(200).json({
      message: 'All users info fetched successfully',
      metadata: users,
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user_id = req.userId.toString();
    if (user_id !== req.params.user_id) {
      return res.status(403).json({
        message: 'You are not authorized to delete this user',
      });
    }

    const user = await User.findByIdAndDelete(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user data from Redis cache
    await invalidateUserCache(user_id);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const getUserReplied = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const cachedReplies = await redisClient.get(`user:${user_id}:replies`);
    if (cachedReplies) {
      return res.status(200).json({
        message: 'User replies fetched successfully (from cache)',
        metadata: JSON.parse(cachedReplies),
      });
    }

    const replies = await Reply.find({ user_id })
      .populate('user_id', '_id name avatar')
      .populate({
        path: 'post_id',
        populate: {
          path: 'user_id',
          select: '_id name avatar',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Cache the replies
    await redisClient.set(`user:${user_id}:replies`, JSON.stringify(replies), { EX: 300 });

    res.status(200).json({
      message: 'User replies fetched successfully',
      metadata: replies,
    });
  } catch (err) {
    next(err);
  }
};

const getUserFollowers = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const cachedFollowers = await redisClient.get(`user:${user_id}:followers`);
    if (cachedFollowers) {
      const { totalFollowers, followers } = JSON.parse(cachedFollowers);
      return res.status(200).json({
        message: 'User followers fetched successfully (from cache)',
        totalFollowers,
        followers,
      });
    }

    const user = await User.findById(user_id)
      .select('followers')
      .populate('followers', '_id name avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalFollowers = user.followers.length;

    await redisClient.set(
      `user:${user_id}:followers`,
      JSON.stringify({ totalFollowers, followers: user.followers }),
      { EX: 300 }
    );

    res.status(200).json({
      message: 'User followers fetched successfully',
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

    const cachedFollowing = await redisClient.get(`user:${user_id}:following`);
    if (cachedFollowing) {
      const { totalFollowing, following } = JSON.parse(cachedFollowing);
      return res.status(200).json({
        message: 'User following fetched successfully (from cache)',
        totalFollowing,
        following,
      });
    }

    const user = await User.findById(user_id)
      .select('following')
      .populate('following', '_id name avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalFollowing = user.following.length;

    await redisClient.set(
      `user:${user_id}:following`,
      JSON.stringify({ totalFollowing, following: user.following }),
      { EX: 300 }
    );

    res.status(200).json({
      message: 'User following fetched successfully',
      totalFollowing,
      following: user.following,
    });
  } catch (err) {
    next(err);
  }
};

const FollowOrUnfollowUser = async (req, res, next) => {
  try {
    const user_id = req.userId.toString();
    const { follower_id } = req.params;

    if (user_id === follower_id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const user = await User.findById(user_id);
    const targetUser = await User.findById(follower_id);

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = user.following.includes(follower_id);

    if (isFollowing) {
      user.following.pull(follower_id);
      targetUser.followers.pull(user_id);

      await user.save();
      await targetUser.save();

      // Invalidate caches
      await invalidateUserCache(user_id);
      await invalidateUserCache(follower_id);

      // Invalidate followers/following caches
      await redisClient.del(`user:${user_id}:following`);
      await redisClient.del(`user:${follower_id}:followers`);

      res.status(200).json({ message: 'Unfollow successful' });
    } else {
      // Follow
      user.following.addToSet(follower_id);
      targetUser.followers.addToSet(user_id);

      await user.save();
      await targetUser.save();

      // Invalidate caches
      await invalidateUserCache(user_id);
      await invalidateUserCache(follower_id);

      // Invalidate followers/following caches
      await redisClient.del(`user:${user_id}:following`);
      await redisClient.del(`user:${follower_id}:followers`);

      res.status(200).json({ message: 'Follow successful' });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateUserInfo,
  getUserInfo,
  getAllUserInfo,
  deleteUser,
  getUserReplied,
  getUserFollowers,
  getUserFollowing,
  FollowOrUnfollowUser,
};
