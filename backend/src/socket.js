const http = require('http');
const socketIo = require('socket.io');
const redisClient = require('./configs/redis');
const User = require('./models/user.model');
const Message = require('./models/message.model');

let socketServer = (app) => {
  const server = http.createServer(app);
  const io = socketIo(server);

  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    // userOnline event, receive accessToken
    socket.on('userOnline', async ({ accessToken }) => {
      const userId = await redisClient.get(`accessToken:${accessToken}`);
      if (userId) {
        const user_id = JSON.parse(userId);
        if (!userSocketMap.has(user_id)) {
          userSocketMap.set(user_id, socket.id);

          await redisClient.subscribe(`notifications:${userId}`, (message) => {
            socket.emit('notification', message);
          });
        }
      }
    });

    // getFollowingAndFollowers event, receive accessToken
    socket.on('getList', async (accessToken) => {
      const userId = await redisClient.get(`accessToken:${accessToken}`);
      if (userId) {
        const user_id = JSON.parse(userId);
        if (!userSocketMap.has(user_id)) {
          userSocketMap.set(user_id, socket.id);

          const user = await User.findById(user_id)
            .select('following followers')
            .populate('following followers', 'name avatar');

          // get last message of each user in following and followers
          const followingMessages = await Message.find({
            $or: [
              { sender: { $in: user.following } },
              { receiver: { $in: user.following } }
            ]
          }).sort({ createdAt: -1 }).limit(1);
          const followerMessages = await Message.find({
            $or: [
              { sender: { $in: user.followers } },
              { receiver: { $in: user.followers } }
            ]
          }).sort({ createdAt: -1 }).limit(1);

          const data = [];

          for (const u of user.following) {
            const lastMessage = followingMessages.find(m => m.sender.toString() === u._id.toString() || m.receiver.toString() === u._id.toString());
            data.push({
              id: u._id,
              fullName: u.name,
              isOnline: userSocketMap.has(u._id),
              userImg: u.avatar,
              lastSeen: lastMessage?.seenAt || '',
              lastMessage: lastMessage?.content || '',
              lastMessageTime: lastMessage?.createdAt || ''
            });
          }

          for (const u of user.followers) {
            const lastMessage = followerMessages.find(m => m.sender.toString() === u._id.toString() || m.receiver.toString() === u._id.toString());
            data.push({
              id: u._id,
              fullName: u.name,
              isOnline: userSocketMap.has(u._id),
              userImg: u.avatar,
              lastSeen: lastMessage?.seenAt || '',
              lastMessage: lastMessage?.content || '',
              lastMessageTime: lastMessage?.createdAt || ''
            });
          }

          // console.log(data);

          socket.emit('getFollowingAndFollowers', data);
        }
      }
    });

    socket.on('register', async (userId) => {
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, socket.id);

        await redisClient.subscribe(`notifications:${userId}`, (message) => {
          socket.emit('notification', message);
        });
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
  return server;
};

module.exports = socketServer;