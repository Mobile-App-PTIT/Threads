const redis = require("redis");

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error", error);
});

let isConnected = false;

const connectRedis = async () => {
    if (!isConnected) {
        await redisClient.connect();
        isConnected = true;
        console.log("Redis client connected");
    }
};

connectRedis();

module.exports = redisClient;
