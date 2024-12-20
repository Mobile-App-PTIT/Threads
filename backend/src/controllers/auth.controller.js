const {
    isNonEmptyString,
    isEmail,
    isEmailInUse,
    isLength
} = require('../utils/validators');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const RefreshToken = require('../models/token.model');
const redisClient = require('../configs/redis');

const signup = async (req, res, next, chatClient) => {
    try {
        const {email, password, name} = req.body;

        // check email
        if (!isEmail(email)) {
            const error = new Error('Invalid email.');
            error.statusCode = 400;
            throw error;
        }
        if (await isEmailInUse(email)) {
            const error = new Error('Email is already in use.');
            error.statusCode = 400;
            throw error;
        }

        // check password
        if (!isNonEmptyString(password)) {
            const error = new Error('Invalid password.');
            error.statusCode = 400;
            throw error;
        }
        if (!isLength(password, {min: 8})) {
            const error = new Error('Password must be at least 8 characters long.');
            error.statusCode = 400;
            throw error;
        }

        // check name
        if (!isNonEmptyString(name)) {
            const error = new Error('Invalid name.');
            error.statusCode = 400;
            throw error;
        }

        // Continue with signup process
        const hashPassword = await bcrypt.hash(password, 12);
        const user = new User({email, password: hashPassword, name});
        await user.save();

        console.log('User created.');
        res.status(201).json({message: 'User created.'});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

const login = async (req, res, next, chatClient) => {
    try {
        const {email, password} = req.body;

        // check email
        if (!isEmail(email)) {
            const error = new Error('Invalid email.');
            error.statusCode = 400;
            throw error;
        }

        // check password
        if (!isNonEmptyString(password)) {
            const error = new Error('Invalid password.');
            error.statusCode = 400;
            throw error;
        }

        // Continue with login process
        const user = await User.findOne({email});
        if (!user) {
            const error = new Error('Email not found.');
            error.statusCode = 404;
            throw error;
        }
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            const error = new Error('Invalid password.');
            error.statusCode = 401;
            throw error;
        }

        const accessToken = jwt.sign(
            {userId: user._id.toString()},
            process.env.JWT_ACCESS_KEY,
            {expiresIn: process.env.JWT_ACCESS_EXPIRATION}
        );
        const refreshToken = jwt.sign(
            {userId: user._id.toString()},
            process.env.JWT_REFRESH_KEY,
            {expiresIn: '7d'}
        );
        const newRefreshToken = new RefreshToken({
            refreshToken,
            userId: user._id,
            expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
        });
        await newRefreshToken.save();

        await chatClient.upsertUser({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        })

        const chatToken = chatClient.createToken(user._id.toString());

        // if redis has existing access token, delete it first before saving new one
        const existingAccessToken = await redisClient.get(`accessToken:${accessToken}`);
        if (existingAccessToken) {
            await redisClient.del(`accessToken:${accessToken}`);
        }
        await redisClient.set(`accessToken:${accessToken}`, JSON.stringify(user._id), {
            EX: 10 * 3600
        });

        res.status(200).json({
            message: 'Login successful.',
            accessToken,
            refreshToken,
            chatToken,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_ACCESS_EXPIRATION,
            user: {
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
                bio: user.bio,
                subname: user.subname,
                followers: user.followers,
                following: user.following
            }
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

const getFcmToken = async (req, res, next) => {
    try {
        const reqUserId = req.userId;
        const user = await User.findById(reqUserId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({fcmToken: user.fcmToken});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

const postFcmToken = async (req, res, next) => {
    try {
        const {fcmToken} = req.body;
        if (!isNonEmptyString(fcmToken)) {
            const error = new Error('FCM token is required.');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        user.fcmToken = fcmToken;
        await user.save();
        res.status(200).json({message: 'FCM token saved.'});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

const refresh = async (req, res, next) => {
    try {
        const {refreshToken} = req.body;

        if (!isNonEmptyString(refreshToken)) {
            const error = new Error('Refresh token is required.');
            error.statusCode = 400;
            throw error;
        }

        const token = await RefreshToken.findOne({refreshToken});
        if (!token) {
            const error = new Error('Invalid refresh token.');
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findById(token.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        const accessToken = jwt.sign(
            {userId: user._id.toString()},
            process.env.JWT_ACCESS_KEY,
            {expiresIn: process.env.JWT_ACCESS_EXPIRATION}
        );
        res.status(200).json({
            message: 'Token refreshed.',
            accessToken,
            expiresIn: process.env.JWT_ACCESS_EXPIRATION
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

module.exports = {signup, login, refresh, postFcmToken, getFcmToken};
