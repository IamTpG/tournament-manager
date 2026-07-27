const { body } = require('express-validator');
const { REGISTRATION_STATUSES } = require('../constants/enums');
const { mongoIdParam, idParam } = require('./common');

/**
 * Đăng ký tham gia giải (endpoint CÔNG KHAI, không cần đăng nhập).
 *
 * Lưu ý bảo mật: KHÔNG có `status` ở đây, và route cũng chỉ lấy đúng các trường
 * bên dưới thay vì spread `...req.body` — nếu không người đăng ký có thể tự gửi
 * `status: 'approved'` để tự duyệt chính mình vào bracket.
 */
const createRegistration = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('Họ tên không được để trống')
        .bail()
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2 đến 100 ký tự'),
    body('personal_id')
        .trim()
        .notEmpty().withMessage('CCCD/STTN không được để trống')
        .bail()
        .isLength({ min: 5, max: 20 }).withMessage('CCCD/STTN phải từ 5 đến 20 ký tự')
        .matches(/^[A-Za-z0-9]+$/).withMessage('CCCD/STTN chỉ được chứa chữ và số'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .bail()
        .isEmail().withMessage('Email không hợp lệ')
        .bail()
        .isLength({ max: 254 }).withMessage('Email quá dài')
        .normalizeEmail({ gmail_remove_dots: false }),
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .bail()
        .matches(/^[0-9+\s.-]{8,20}$/).withMessage('Số điện thoại không hợp lệ'),
    body('name_in_tournament')
        .trim()
        .notEmpty().withMessage('Tên trong giải đấu không được để trống')
        .bail()
        .isLength({ min: 2, max: 50 }).withMessage('Tên trong giải đấu phải từ 2 đến 50 ký tự'),
    body('tournament_id')
        .trim()
        .notEmpty().withMessage('Mã giải đấu không được để trống')
        .bail()
        .isLength({ max: 100 }).withMessage('Mã giải đấu quá dài')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã giải đấu không hợp lệ')
];

const approveMember = [
    mongoIdParam('id', 'Mã thành viên'),
    body('status')
        .trim()
        .notEmpty().withMessage('Trạng thái không được để trống')
        .bail()
        .isIn(REGISTRATION_STATUSES)
        .withMessage(`Trạng thái phải là một trong: ${REGISTRATION_STATUSES.join(', ')}`)
];

const membersByTournament = [idParam('tournament_id', 'Mã giải đấu')];

module.exports = { createRegistration, approveMember, membersByTournament };
