const express = require('express');
const router = express.Router();

const Register = require('../model/register');
const { verifyToken } = require('../middleware/verifyToken');
const { handleValidation } = require('../middleware/handleValidation');
const registerRules = require('../validators/registerValidators');
const { sendMongooseError } = require('../utils/errorResponse');

/**
 * Danh sách người chơi chỉ cần id và tên thi đấu để map ID sang tên trên bracket.
 * Trước đây các endpoint này trả về NGUYÊN document đăng ký — gồm cả personal_id
 * (CCCD), email và số điện thoại — trong đó có một endpoint không hề yêu cầu đăng nhập.
 */
const PLAYER_LIST_FIELDS = { _id: 0, id: 1, name_in_tournament: 1 };

// GET /api/admin/members - Lấy danh sách thành viên
router.get('/', verifyToken, async (req, res) => {
  try {
    const members = await Register.find().sort({ register_date: -1 });
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error); // <--- this will show exact cause
    sendMongooseError(res, error, 'Không thể xử lý yêu cầu thành viên');
  }
});

// PUT /api/admin/members/:id/approve - Duyệt/từ chối thành viên
router.put('/:id/approve', verifyToken, registerRules.approveMember, handleValidation, async (req, res) => {
  try {
    const { status } = req.body;

    // runValidators: mặc định findByIdAndUpdate KHÔNG chạy validator của schema,
    // nên enum status bị bỏ qua hoàn toàn và giá trị rác vẫn được ghi vào DB.
    const updated = await Register.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    // Trước đây không kiểm tra kết quả: id không tồn tại vẫn trả 200 "thành công".
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công!' });
  } catch (error) {
    console.error('[ERROR][approveMember]:', error);
    sendMongooseError(res, error, 'Không thể xử lý yêu cầu thành viên');
  }
});


// GET /api/admin/members/tournament/:tournament_id - Lấy danh sách thành viên của một giải đấu
router.get('/tournament/:tournament_id', verifyToken, registerRules.membersByTournament, handleValidation, async (req, res) => {
  try {
      const { tournament_id } = req.params;
      const approvedRegistrations = await Register.find(
          { tournament_id: tournament_id, status: 'approved' },
          PLAYER_LIST_FIELDS
      );
      res.json(approvedRegistrations);
  } catch (error) {
      console.error('Error fetching approved members for tournament:', error);
      sendMongooseError(res, error, 'Không thể xử lý yêu cầu thành viên');
  }
});


// GET /api/admin/members/tournament/:tournament_id/public - Lấy danh sách thành viên công khai
// Endpoint mới này sẽ không sử dụng middleware verifyToken
router.get('/tournament/:tournament_id/public', registerRules.membersByTournament, handleValidation, async (req, res) => {
  try {
      const { tournament_id } = req.params;
      const approvedRegistrations = await Register.find(
          { tournament_id: tournament_id, status: 'approved' },
          PLAYER_LIST_FIELDS
      );
      res.json(approvedRegistrations);
  } catch (error) {
      console.error('Error fetching public members for tournament:', error);
      sendMongooseError(res, error, 'Không thể xử lý yêu cầu thành viên');
  }
});

module.exports = router;
