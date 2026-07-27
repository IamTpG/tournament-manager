/**
 * Chuyển lỗi Mongoose/MongoDB thành response HTTP đúng ngữ nghĩa.
 *
 * Trước đây mọi lỗi đều rơi vào catch chung và trả 500, nên client không phân
 * biệt được "gửi sai dữ liệu" với "server hỏng". Một số nơi còn trả thẳng
 * `error.message`, làm lộ chuỗi E11000 kèm tên database, tên collection và tên
 * chỉ mục ra trình duyệt.
 *
 * @param {Object} res - Express response object
 * @param {Error} error - Lỗi bắt được từ Mongoose/MongoDB
 * @param {String} fallbackMessage - Thông báo dùng khi đây là lỗi server thật
 * @returns {*} - Response đã gửi
 */
const sendMongooseError = (res, error, fallbackMessage) => {
    // Sai schema (required, enum, min/max, maxlength, validator tuỳ chỉnh)
    if (error.name === 'ValidationError') {
        const errors = {};
        for (const [field, detail] of Object.entries(error.errors || {})) {
            errors[field] = detail.message;
        }
        const firstMessage = Object.values(errors)[0] || 'Dữ liệu không hợp lệ';
        return res.status(400).json({ message: firstMessage, errors });
    }

    // Sai kiểu dữ liệu (ví dụ ngày tháng không parse được, ObjectId không hợp lệ)
    if (error.name === 'CastError') {
        return res.status(400).json({
            message: `Giá trị không hợp lệ cho trường "${error.path}"`
        });
    }

    // Trùng khoá duy nhất — trả 409 thay vì để lộ chi tiết chỉ mục
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
    }

    return res.status(500).json({ message: fallbackMessage });
};

module.exports = { sendMongooseError };
