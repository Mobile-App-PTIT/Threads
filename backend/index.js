const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const passport = require('passport')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(morgan('dev'))

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const mess = error.message;
    const data = error.data;
    res.status(status).json({message: mess, data: data});
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})
