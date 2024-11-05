const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const redisClient = require('./configs/redis'); 
const socketIo = require("socket.io");
const compression = require("compression");
const initWebRoutes = require("./routes/init.route");
const User = require("./models/user.model");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  
  socket.on("register", async (userId) => {
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, socket.id);
  
      await redisClient.subscribe(`notifications:${userId}`, (message) => {
        socket.emit("notification", message);
      });
    }
  });
  
  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));

initWebRoutes(app);

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne();
    if (!user) {
      const newUser = new User({
        email: "admin@gmail.com",
        password: "123456", 
        username: "admin",
        name: "No Name",
      });
      await newUser.save();
    }

    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error("Cannot connect to the database", err);
  });
