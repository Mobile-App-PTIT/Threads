const Reply = require('../models/reply.model');
const redisClient = require('../configs/redis');

const getUserRepliedNotification = async (req, res, next) => {
    try {
      const { user_id } = req.params;
  
      const replies = await Reply.find({
        user_id,
        replies: { $exists: true, $not: { $size: 0 } }
      }).populate({
        'path': 'replies',
        'populate': {
          'path': 'user_id',
          'select': '_id name avatar'
        }
      }).populate('user_id', '_id name avatar').sort({ createdAt: -1 }).lean();
  
      res.status(200).json({
        message: 'User replies fetched successfully',
        metadata: replies
      });
    } catch (err) {
      next(err);
    }
};

const getAllNotifications = async (req, res, next) => {
    try {
        const user_id = req.userId;

        const cachedNotifications = await redisClient.get(`notification:${user_id}`);
        if (cachedNotifications) {
            return res.status(200).json({
                message: 'Notifications fetched successfully (from cache)',
                metadata: JSON.parse(cachedNotifications),
            });
        }

        res.status(200).json({
            message: 'Notifications fetched successfully',
            metadata: [],
        });
    } catch(err) {
        next(err);
    }
}

module.exports = {
    getUserRepliedNotification,
    getAllNotifications,
}