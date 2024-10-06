const redis = require("redis");

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (error) => {
    console.error(error);
});

module.exports = redisClient;