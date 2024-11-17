const http = require('http');
const socketIo = require('socket.io');
const redisClient = require('./configs/redis');
const User = require('./models/user.model');
const Message = require('./models/message.model');


let socketServer = (app) => {
  const server = http.createServer(app);
  const io = socketIo(server);

  const userSocketMap = new Map();

  io.on('connection', async (socket) => {
    try {
      console.log('[Server] User connected ' + socket.id);
      const token = socket.handshake.query.token;
      const userId = await redisClient.get(`accessToken:${token}`);
      if (userId) {
        const user_id = JSON.parse(userId);
        if (!userSocketMap.has(user_id)) {
          userSocketMap.set(user_id, socket.id);

          // await redisClient.subscribe(`notifications:${userId}`, (message) => {
          //   socket.emit('notification', message);
          // });

          // send online status to all friends
          const user = await User.findById(user_id).select('following followers');
          for (const u of user.following) {
            if (userSocketMap.has(u._id.toString())) {
              io.to(userSocketMap.get(u._id.toString())).emit('online', user_id);
            }
          }
          for (const u of user.followers) {
            if (userSocketMap.has(u._id.toString())) {
              io.to(userSocketMap.get(u._id.toString())).emit('online', user_id);
            }
          }
        }
      }

      // getFollowingAndFollowers event, receive accessToken
      socket.on('getList', async (accessToken) => {
        try {
          console.log('[Server] Get list of following and followers');
          const userId = await redisClient.get(`accessToken:${accessToken}`);
          if (userId) {
            const user_id = JSON.parse(userId);

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
                isOnline: userSocketMap.has(u._id.toString()),
                userImg: u.avatar,
                lastSeen: lastMessage?.seenAt || '',
                lastMessage: lastMessage?.content || '',
                lastMessageTime: lastMessage?.createdAt || ''
              });
            }

            for (const u of user.followers) {
              const lastMessage = followerMessages.find(m => m.sender.toString() === u._id.toString() || m.receiver.toString() === u._id.toString());
              // check if user is already in data
              const index = data.findIndex(d => d.id === u._id);
              if (index !== -1) {
                data.push({
                  id: u._id,
                  fullName: u.name,
                  isOnline: userSocketMap.has(u._id.toString()),
                  userImg: u.avatar,
                  lastSeen: lastMessage?.seenAt || '',
                  lastMessage: lastMessage?.content || '',
                  lastMessageTime: lastMessage?.createdAt || ''
                });
              }
            }

            console.log(data);

            socket.emit('getFollowingAndFollowers', data);
          }
        } catch (error) {
          console.log(error);
        }
      });

      socket.on('sendMessage', async (data) => {
        try {
          console.log('[Server] Send message');
          const { text, createdAt, user, accessToken } = data;
          const sender = await redisClient.get(`accessToken:${accessToken}`);
          const message = new Message({
            type: 'text',
            content: text,
            status: 'sent',
            sender_id: JSON.parse(sender),
            receiver_id: user._id,
            created_at: createdAt
          });
          await message.save();

          if (userSocketMap.has(user._id)) {
            // send to ChatScreen
            io.to(userSocketMap.get(user._id)).emit('receiveMessage', {
              _id: message._id,
              text: message.content,
              createdAt: message.created_at,
              user: {
                _id: message.receiver_id
              }
            });

            // send to ListMessageScreen
            const lastMessage = await Message.findOne({
              $or: [
                { sender_id: message.sender_id, receiver_id: message.receiver_id },
                { sender_id: message.receiver_id, receiver_id: message.sender_id }
              ]
            }).sort({ created_at: -1 });
            const user = await User.findById(message.sender_id).select('name avatar');
            const data = {
              id: user._id,
              fullName: user.name,
              isOnline: userSocketMap.has(user._id.toString()),
              userImg: user.avatar,
              lastSeen: lastMessage?.seenAt || '',
              lastMessage: lastMessage?.content || '',
              lastMessageTime: lastMessage?.created_at || ''
            };
            socket.emit('newLastMessage', data);
          }
        } catch (error) {
          console.log(error);
        }
      });


      const disconnect = async () => {
        console.log('[Server] User disconnected ' + socket.id);
        for (const [userId, socketId] of userSocketMap.entries()) {
          if (socketId === socket.id) {
            // send offline status to all friends
            const user = await User.findById(userId).select('following followers');
            for (const u of user.following) {
              if (userSocketMap.has(u._id.toString())) {
                io.to(userSocketMap.get(u._id.toString())).emit('offline', userId);
              }
            }
            for (const u of user.followers) {
              if (userSocketMap.has(u._id.toString())) {
                io.to(userSocketMap.get(u._id.toString())).emit('offline', userId);
              }
            }
            userSocketMap.delete(userId);
            break;
          }
        }
        console.log('User disconnected:', socket.id);
      };

      socket.on('cus-disconnect', disconnect);

      socket.on('disconnect', disconnect);

    } catch (error) {
      console.log(error);
    }
  });
  return server;
};

module.exports = socketServer;