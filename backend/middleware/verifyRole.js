/**
* Middleware to check if the logged-in user has the required role.
* @param {string} requiredRole - The role that is required to access the route (e.g., 'admin')
* @returns {Function} Middleware function that checks admin role
*/
const verifyRole = (requiredRole) => {
    /**
    * 
    * @param {*} req - Express request object, with `user` property injected by verifyToken middleware
    * @param {*} res - Express response object
    * @param {*} next - Express next middleware function
    * @returns {*} - 403 Forbidden if user role is insufficient, otherwise calls next()
    */
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
};
  
module.exports = {verifyRole};