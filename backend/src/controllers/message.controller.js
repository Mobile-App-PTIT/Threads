const Message = require('../models/message.model');

const updateSeenStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;
    const { seenAt } = req.body;
    // find and update all messages from other user to current user with status 'sent' to 'read'
    await Message.updateMany(
      { sender_id: otherUserId, receiver_id: userId, status: 'sent' },
      { status: 'read', seenAt }
    );
    res.status(200).json({ message: 'Seen status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMessagesByUserIds = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { $and: [{ sender_id: userId }, { receiver_id: otherUserId }] },
        { $and: [{ sender_id: otherUserId }, { receiver_id: userId }] }
      ]
    }).sort({ createdAt: 1 });
    // console.log(messages);
    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'Messages not found' });
    }
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateSeenStatus,
  getMessagesByUserIds
};