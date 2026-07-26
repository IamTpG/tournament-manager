const { body } = require('express-validator');
const { MATCH_STATUSES } = require('../constants/enums');
const { URL_OPTIONS, idParam } = require('./common');

/**
 * Cập nhật kết quả một trận đấu.
 *
 * Controller đã tự kiểm tra `player` có thuộc trận đấu không (cần truy vấn DB
 * nên không đưa vào đây được); phần dưới lo kiểu dữ liệu, giới hạn và enum —
 * những thứ trước đây rơi xuống Mongoose rồi trả về 500 thay vì 400.
 */
const updateMatchResult = [
    idParam('match_id', 'Mã trận đấu'),
    body('results')
        .isArray({ min: 1, max: 64 }).withMessage('Kết quả phải là danh sách không rỗng'),
    body('results.*.player')
        .isString().withMessage('Mã người chơi không hợp lệ')
        .bail()
        .trim()
        .notEmpty().withMessage('Mã người chơi không được để trống'),
    body('results.*.score')
        .isInt({ min: 0, max: 100000 }).withMessage('Điểm phải là số nguyên không âm')
        .toInt(),
    body('status')
        .optional()
        .trim()
        .isIn(MATCH_STATUSES).withMessage(`Trạng thái phải là một trong: ${MATCH_STATUSES.join(', ')}`),
    body('highlightLink')
        .optional({ values: 'falsy' })
        .trim()
        .isURL(URL_OPTIONS).withMessage('Link highlight phải là đường dẫn http(s) hợp lệ'),
    body('notes')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 2000 }).withMessage('Ghi chú quá dài'),
    // Không cho hai dòng kết quả cùng trỏ về một người chơi — trước đây bản ghi
    // thứ hai bị bỏ qua âm thầm và lưu lại dữ liệu mâu thuẫn.
    body('results').custom((results) => {
        if (!Array.isArray(results)) return true;
        const ids = results.map(r => r && r.player);
        if (new Set(ids).size !== ids.length) {
            throw new Error('Mỗi người chơi chỉ được có một dòng kết quả');
        }
        return true;
    })
];

const matchIdParam = [idParam('match_id', 'Mã trận đấu')];

module.exports = { updateMatchResult, matchIdParam };
