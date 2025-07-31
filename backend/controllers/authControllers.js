const account = require('../model/admin_account');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Authenticates a user and returns a JWT token on success.
 * Only for admin role.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON containing the JWT token or an error message
 */
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin_account = await account.findOne({username});
        if (!admin_account) return res.status(404).json({message: 'User not found'});

        // const is_match = await bcrypt.compare(password, admin_account.password);
        let is_match = false
        if (password === admin_account.password) {
            is_match = true
        }

        if (!is_match) return res.status(401).json({message: 'Incorrect password'});

        const token = jwt.sign(
            { userId: admin_account._id, role: admin_account.role },
            process.env.JWT_SECRET
        );

        res.json({token});
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
};

modules.export = {login};