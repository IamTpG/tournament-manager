/**
 * Các tập giá trị đóng dùng chung cho cả Mongoose schema lẫn validation chain,
 * để hai nơi không bị lệch nhau khi thêm/sửa giá trị.
 */
const TOURNAMENT_FORMATS = ['Loại trực tiếp', 'Loại lần 2', 'Xếp hạng'];

const REGISTRATION_STATUSES = ['pending', 'approved', 'rejected'];

const MATCH_STATUSES = ['pending', 'ongoing', 'completed', 'cancelled'];

const BRACKET_TYPES = ['winners', 'losers', 'grand_finals'];

// Giới hạn số người tham gia: createMatches sinh ra khoảng 2N document cho một
// bracket, nên cần chặn trên để một request không tạo ra lượng ghi không kiểm soát.
const MAX_PARTICIPANTS = 1024;
const MIN_PARTICIPANTS = 2;

module.exports = {
    TOURNAMENT_FORMATS,
    REGISTRATION_STATUSES,
    MATCH_STATUSES,
    BRACKET_TYPES,
    MAX_PARTICIPANTS,
    MIN_PARTICIPANTS
};
