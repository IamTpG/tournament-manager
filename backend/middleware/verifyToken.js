const jwt = require('jsonwebtoken')

/**
 * Middleware to verify the JWT token from the request headers.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {*} - Returns 401 if no token is provided, 403 if invalid token,
 *                or calls next() if token is valid and decoded
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[ERROR][verifyToken]: Empty token');
        return res.status(401).json({message: 'Unauthorized: No token provided' });
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
        console.log('[ERROR][verifyToken]:', err);
      return res.status(403).json({message: 'Invalid or expired token'});
    }
};
  
module.exports = {verifyToken};
