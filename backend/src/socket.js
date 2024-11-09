const http = require('http');
const socketIo = require('socket.io');
const redisClient = require('./configs/redis');
const User = require('./models/user.model');

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