const account = require('../model/admin_account');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
        // Chốt chặn thứ hai sau validator: username phải là chuỗi. Nếu để nguyên
        // giá trị từ body, một object như {"$regex": "^a"} sẽ trở thành toán tử
        // truy vấn MongoDB và cho phép dò tên tài khoản.
        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ' });
        }

        const admin_account = await account.findOne({username});

        // Cùng một thông báo cho "không có tài khoản" và "sai mật khẩu": trước đây
        // 404 vs 401 là một oracle để dò xem tên đăng nhập nào có thật.
        const INVALID_CREDENTIALS = 'Tài khoản hoặc mật khẩu không đúng';
        if (!admin_account) return res.status(401).json({message: INVALID_CREDENTIALS});

        const is_match = await bcrypt.compare(password, admin_account.password);
        if (!is_match) return res.status(401).json({message: INVALID_CREDENTIALS});

        const token = jwt.sign(
            { userId: admin_account._id, role: admin_account.role },
            process.env.JWT_SECRET
        );

        res.json({token});
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
};

module.exports = {login};