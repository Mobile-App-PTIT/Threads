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

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: err
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})
