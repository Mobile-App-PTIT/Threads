const http = require('http');
const socketIo = require('socket.io');
const redisClient = require('./configs/redis');
const User = require('./models/user.model');
const Message = require('./models/message.model');
const { formatDate } = require('./utils/validators');


let socketServer = (app, notification) => {
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

            // get last message of each conversation between user and following/followers by createdAt
            const followerMessage = await Message.find({
              $or: [
                { sender_id: user_id, receiver_id: { $in: user.followers.map(f => f._id) } },
                { receiver_id: user_id, sender_id: { $in: user.followers.map(f => f._id) } }
              ]
            }).sort({ created_at: -1 });

            const lastFollowersMessages = user.followers.map(f => {
              return followerMessage.find(
                m => m.sender_id.toString() === f._id.toString() ||
                  m.receiver_id.toString() === f._id.toString()
              );
            }).filter(message => message !== undefined);

            const followingMessage = await Message.find({
              $or: [
                { sender_id: user_id, receiver_id: { $in: user.following.map(f => f._id) } },
                { receiver_id: user_id, sender_id: { $in: user.following.map(f => f._id) } }
              ]
            }).sort({ created_at: -1 });

            const lastFollowingMessages = user.following.map(f => {
              return followingMessage.find(
                m => m.sender_id.toString() === f._id.toString() ||
                  m.receiver_id.toString() === f._id.toString()
              );
            }).filter(message => message !== undefined);

            // console.log(followerMessage);
            // console.log(lastFollowingMessages);

            const data = [];

            for (const u of user.following) {
              const lastMessage = lastFollowingMessages.find(
                m =>
                  m.sender_id && (
                    m.sender_id.toString() === u._id.toString() ||
                    m.receiver_id.toString() === u._id.toString()
                  )
              );

              data.push({
                id: u._id,
                fullName: u.name,
                isOnline: userSocketMap.has(u._id.toString()),
                userImg: u.avatar,
                status: lastMessage?.status || '',
                isMe: lastMessage?.sender_id.toString() === user_id.toString(),
                lastSeen: lastMessage?.seenAt || '',
                typeMessage: lastMessage?.type || '',
                lastMessage: lastMessage?.content || '',
                lastMessageTime: lastMessage?.created_at ? formatDate(lastMessage.created_at) : ''
              });
            }

            for (const u of user.followers) {
              const lastMessage = lastFollowersMessages.find(
                m =>
                  m.sender_id && (
                    m.sender_id.toString() === u._id.toString() ||
                    m.receiver_id.toString() === u._id.toString()
                  )
              );

              // check if user is already in data
              const index = data.findIndex(d => d.id === u._id);
              if (index !== -1) {
                data.push({
                  id: u._id,
                  fullName: u.name,
                  isOnline: userSocketMap.has(u._id.toString()),
                  userImg: u.avatar,
                  status: lastMessage?.status || '',
                  isMe: lastMessage?.sender_id.toString() === user_id.toString(),
                  lastSeen: lastMessage?.seenAt || '',
                  typeMessage: lastMessage?.type || '',
                  lastMessage: lastMessage?.content || '',
                  lastMessageTime: lastMessage?.created_at ? formatDate(lastMessage.created_at) : ''
                });
              }
            }

            // console.log(data);

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

          if (userSocketMap.has(user._id.toString())) {

            // send notification to receiver

            const receiverFcmToken = await User.findById(user._id).select('fcmToken');

            const messagePayload = {
                notification: {
                    title: 'New message',
                    body: text
                },
                token: receiverFcmToken.fcmToken
            }

            notification.messaging().send(messagePayload)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });

            // send to ChatScreen
            io.to(userSocketMap.get(user._id.toString())).emit('receiveMessage', {
              _id: message._id,
              text: message.content,
              status: message?.status || '',
              createdAt: message.created_at,
              user: {
                _id: message.receiver_id
              }
            });

            // send to ListMessageScreen of receiver
            io.to(userSocketMap.get(user._id.toString())).emit('newLastMessage', {
              id: message.sender_id,
              status: message?.status || '',
              isMe: false,
              lastSeen: message?.seenAt || '',
              lastMessage: message?.content || '',
              lastMessageTime: message?.created_at ? formatDate(message.created_at) : ''
            });
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