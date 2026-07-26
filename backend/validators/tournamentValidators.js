const { body } = require('express-validator');
const { TOURNAMENT_FORMATS, MIN_PARTICIPANTS, MAX_PARTICIPANTS } = require('../constants/enums');
const { URL_OPTIONS, idParam, filterQuery } = require('./common');

// end_date phải không sớm hơn start_date. Dùng cho cả tạo mới lẫn cập nhật —
// khi cập nhật một phần, nếu thiếu một trong hai thì bỏ qua (controller sẽ đối
// chiếu với giá trị đang lưu).
const endDateNotBeforeStart = (value, { req }) => {
    const start = req.body.start_date;
    if (!start || !value) return true;
    if (new Date(value) < new Date(start)) {
        throw new Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
    }
    return true;
};

const createTournament = [
    body('id')
        .trim()
        .notEmpty().withMessage('Mã giải đấu không được để trống')
        .bail()
        .isLength({ max: 100 }).withMessage('Mã giải đấu quá dài')
        .matches(/^[A-Za-z0-9]+$/).withMessage('Mã giải đấu chỉ được chứa chữ và số'),
    body('game')
        .trim()
        .notEmpty().withMessage('Game không được để trống')
        .bail()
        .isLength({ max: 100 }).withMessage('Tên game quá dài'),
    body('title')
        .trim()
        .notEmpty().withMessage('Tiêu đề không được để trống')
        .bail()
        .isLength({ max: 200 }).withMessage('Tiêu đề quá dài'),
    body('format')
        .trim()
        .notEmpty().withMessage('Loại hình không được để trống')
        .bail()
        .isIn(TOURNAMENT_FORMATS).withMessage(`Loại hình phải là một trong: ${TOURNAMENT_FORMATS.join(', ')}`),
    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 5000 }).withMessage('Mô tả quá dài'),
    body('participants')
        .notEmpty().withMessage('Số người tham gia không được để trống')
        .bail()
        .isInt({ min: MIN_PARTICIPANTS, max: MAX_PARTICIPANTS })
        .withMessage(`Số người tham gia phải là số nguyên từ ${MIN_PARTICIPANTS} đến ${MAX_PARTICIPANTS}`)
        .toInt(),
    body('image')
        .optional({ values: 'falsy' })
        .trim()
        .isURL(URL_OPTIONS).withMessage('Ảnh phải là đường dẫn http(s) hợp lệ'),
    body('start_date')
        .notEmpty().withMessage('Ngày bắt đầu không được để trống')
        .bail()
        .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
    body('end_date')
        .notEmpty().withMessage('Ngày kết thúc không được để trống')
        .bail()
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ')
        .bail()
        .custom(endDateNotBeforeStart)
];

// Cập nhật là partial update: mọi trường đều tuỳ chọn, nhưng nếu gửi lên thì
// phải hợp lệ. `id` KHÔNG nằm ở đây — nó là khoá join sang match/register nên
// controller cũng chặn không cho sửa.
const updateTournament = [
    idParam('tournament_id', 'Mã giải đấu'),
    body('game')
        .optional()
        .trim()
        .notEmpty().withMessage('Game không được để trống')
        .bail()
        .isLength({ max: 100 }).withMessage('Tên game quá dài'),
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Tiêu đề không được để trống')
        .bail()
        .isLength({ max: 200 }).withMessage('Tiêu đề quá dài'),
    body('format')
        .optional()
        .trim()
        .isIn(TOURNAMENT_FORMATS).withMessage(`Loại hình phải là một trong: ${TOURNAMENT_FORMATS.join(', ')}`),
    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 5000 }).withMessage('Mô tả quá dài'),
    body('participants')
        .optional()
        .isInt({ min: MIN_PARTICIPANTS, max: MAX_PARTICIPANTS })
        .withMessage(`Số người tham gia phải là số nguyên từ ${MIN_PARTICIPANTS} đến ${MAX_PARTICIPANTS}`)
        .toInt(),
    body('image')
        .optional({ values: 'falsy' })
        .trim()
        .isURL(URL_OPTIONS).withMessage('Ảnh phải là đường dẫn http(s) hợp lệ'),
    body('start_date')
        .optional()
        .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
    body('end_date')
        .optional()
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ')
        .bail()
        .custom(endDateNotBeforeStart)
];

const tournamentIdParam = [idParam('tournament_id', 'Mã giải đấu')];

module.exports = {
    createTournament,
    updateTournament,
    tournamentIdParam,
    filterTournaments: filterQuery
};
