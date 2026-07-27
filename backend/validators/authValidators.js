const { body } = require('express-validator');

/**
 * Đăng nhập admin.
 *
 * `.isString()` ở đây không chỉ để báo lỗi đẹp: trước đây `username` được đưa
 * thẳng vào `findOne({ username })`, nên một body dạng
 * `{"username": {"$regex": "^a"}}` sẽ biến thành toán tử truy vấn MongoDB và
 * cho phép dò tên tài khoản. Ép kiểu chuỗi là chốt chặn cho lỗ hổng đó.
 */
const login = [
    body('username')
        .isString().withMessage('Tên đăng nhập không hợp lệ')
        .bail()
        .trim()
        .notEmpty().withMessage('Tên đăng nhập không được để trống')
        .bail()
        .isLength({ max: 100 }).withMessage('Tên đăng nhập quá dài'),
    body('password')
        .isString().withMessage('Mật khẩu không hợp lệ')
        .bail()
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .bail()
        .isLength({ max: 200 }).withMessage('Mật khẩu quá dài')
];

module.exports = { login };
