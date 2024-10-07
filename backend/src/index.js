const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const initWebRoutes = require("./routes/init.route");
const User = require("./models/user.model");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
// app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

initWebRoutes(app);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const mess = error.message;
  const data = error.data;
  res.status(status).json({ message: mess, data: data });
});

mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then((result) => {
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            email: "admin@gmail.com",
            password: "123456",
            username: "admin",
            name: "No Name",
          });
          user.save();
        }
      })
      .catch((err) => {
        console.log(err);
      });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("Cannot connect to the database", err);
  });
