const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const initWebRoutes = require('./routes/init.route');
const User = require('./models/user.model');
const socketServer = require('./socket');
const notification = require('./notification');
require('dotenv').config();

const app = express();

const notify = notification();

const server = socketServer(app, notify);

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));

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
        email: 'admin@gmail.com',
        password: '123456',
        username: 'admin',
        name: 'No Name'
      });
      await newUser.save();
    }

    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error('Cannot connect to the database', err);
  });
