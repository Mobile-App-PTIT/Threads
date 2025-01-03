const jwt = require('jsonwebtoken');

const isAuth = async (req, res, next) => {
  try {
    let authHeader = req.get('Authorization');
    if (!authHeader) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    authHeader = authHeader.split(' ')[1];

    let decodedToken;
    try {
      decodedToken = jwt.verify(authHeader, process.env.JWT_ACCESS_KEY);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    if (!decodedToken) {
      const error = new Error('Not authenticated, token not found.');
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

module.exports = { isAuth };
