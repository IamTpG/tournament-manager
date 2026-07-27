const { param, query } = require('express-validator');

// Tuỳ chọn dùng chung cho các trường URL (ảnh, link bài viết, link video).
// Chỉ cho phép http/https — chặn `javascript:` và `data:` vốn được render
// thẳng vào thuộc tính src/href ở frontend.
const URL_OPTIONS = {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false // cho phép localhost khi phát triển
};

/**
 * Định danh nghiệp vụ dạng chuỗi nằm trên URL (tournament_id, match_id).
 * Không cho chứa ký tự đường dẫn/khoảng trắng vì giá trị này được ghép thẳng
 * vào route và dùng làm khoá join giữa các collection.
 */
const idParam = (name, label) =>
    param(name)
        .trim()
        .notEmpty().withMessage(`${label} không được để trống`)
        .bail()
        .isLength({ max: 100 }).withMessage(`${label} quá dài`)
        .matches(/^[A-Za-z0-9_-]+$/).withMessage(`${label} chỉ được chứa chữ, số, gạch ngang và gạch dưới`);

const mongoIdParam = (name, label) =>
    param(name)
        .isMongoId().withMessage(`${label} không hợp lệ`);

/**
 * Query filter cho GET /tournament/filter — cả hai đều tuỳ chọn, nhưng nếu có
 * thì phải đúng kiểu, tránh `new Date('garbage')` tạo Invalid Date rồi 500.
 */
const filterQuery = [
    query('game')
        .optional()
        .isString().withMessage('Game không hợp lệ')
        .trim()
        .isLength({ max: 100 }).withMessage('Game quá dài'),
    query('date')
        .optional()
        .isISO8601().withMessage('Ngày lọc phải đúng định dạng YYYY-MM-DD')
];

module.exports = { URL_OPTIONS, idParam, mongoIdParam, filterQuery };
