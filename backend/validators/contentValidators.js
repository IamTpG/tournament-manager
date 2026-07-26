const { body } = require('express-validator');
const { URL_OPTIONS } = require('./common');

/**
 * Tin tức. Trước đây schema không bắt buộc trường nào nên `POST {}` vẫn tạo ra
 * một bản ghi rỗng và trả về 201; ngoài ra `published_day: null` lọt được vào DB
 * rồi làm `GET /api/news` 500 vĩnh viễn cho toàn bộ danh sách.
 */
const createNews = [
    body('title')
        .trim()
        .notEmpty().withMessage('Tiêu đề không được để trống')
        .bail()
        .isLength({ max: 200 }).withMessage('Tiêu đề quá dài'),
    body('content')
        .trim()
        .notEmpty().withMessage('Nội dung không được để trống')
        .bail()
        .isLength({ max: 10000 }).withMessage('Nội dung quá dài'),
    body('image')
        .trim()
        .notEmpty().withMessage('Ảnh không được để trống')
        .bail()
        .isURL(URL_OPTIONS).withMessage('Ảnh phải là đường dẫn http(s) hợp lệ'),
    body('link')
        .trim()
        .notEmpty().withMessage('Đường dẫn liên kết không được để trống')
        .bail()
        .isURL(URL_OPTIONS).withMessage('Đường dẫn liên kết phải là http(s) hợp lệ'),
    body('published_day')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Ngày đăng không hợp lệ')
];

const createHighlight = [
    body('title')
        .trim()
        .notEmpty().withMessage('Tiêu đề không được để trống')
        .bail()
        .isLength({ max: 200 }).withMessage('Tiêu đề quá dài'),
    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả không được để trống')
        .bail()
        .isLength({ max: 5000 }).withMessage('Mô tả quá dài'),
    body('image')
        .trim()
        .notEmpty().withMessage('Ảnh không được để trống')
        .bail()
        .isURL(URL_OPTIONS).withMessage('Ảnh phải là đường dẫn http(s) hợp lệ'),
    // Tên trường viết hoa `URL` để khớp schema và HighlightCard.jsx.
    body('URL')
        .trim()
        .notEmpty().withMessage('Link video không được để trống')
        .bail()
        .isURL(URL_OPTIONS).withMessage('Link video phải là đường dẫn http(s) hợp lệ')
];

module.exports = { createNews, createHighlight };
