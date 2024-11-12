const Message = require('../models/message.model');

const updateSeenStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;
    const { seenAt } = req.body;
    // update all messages from otherUserId to userId
    await Message.updateMany({
      sender_id: otherUserId,
      receiver_id: userId
    }, { $set: { seenAt: seenAt } });
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
        { $and: [{ sender: userId }, { receiver: otherUserId }] },
        { $and: [{ sender: otherUserId }, { receiver: userId }] }
      ]
    }).sort({ createdAt: 1 });
    if (!messages) {
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