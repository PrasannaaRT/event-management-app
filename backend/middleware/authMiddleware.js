// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Export protect as a named property of an object
exports.protect = function(req, res, next) { // Changed module.exports to exports.protect
  // 1. Get token from header
  const token = req.header('Authorization');

  // 2. Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // A token looks like: "Bearer [token_string]". We need to remove "Bearer ".
  const tokenString = token.split(' ')[1];

  // 3. Verify token
  try {
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

    // Add user from payload to the request object
    req.user = decoded.user;
    next(); // Move to the next function (our controller)
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};