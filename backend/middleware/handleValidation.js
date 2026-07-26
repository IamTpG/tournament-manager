const { validationResult } = require('express-validator');

/**
 * Middleware chạy sau các validation chain của express-validator.
 * Nếu có lỗi, trả về 400 và DỪNG request trước khi vào controller.
 *
 * Giữ nguyên quy ước response của dự án (`{ message }`) để mọi chỗ frontend đang
 * đọc `err.response.data.message` vẫn hoạt động, đồng thời bổ sung `errors` dạng
 * { tênTrường: thông báo } cho phép hiển thị lỗi ngay tại từng ô nhập.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {*} - Trả về 400 nếu dữ liệu không hợp lệ, ngược lại gọi next()
 */
const handleValidation = (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errors = {};
    for (const err of result.array()) {
        // Chỉ giữ lỗi ĐẦU TIÊN của mỗi trường — thông báo đầu tiên là cụ thể nhất.
        if (err.path && !errors[err.path]) errors[err.path] = err.msg;
    }

    const firstMessage = result.array()[0].msg;
    console.log(`[VALIDATION][${req.method} ${req.originalUrl}]:`, errors);

    return res.status(400).json({ message: firstMessage, errors });
};

module.exports = { handleValidation };
