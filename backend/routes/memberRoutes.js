const express = require('express');
const router = express.Router();

const Register = require('../model/register');
const { verifyToken } = require('../middleware/verifyToken');
const { handleValidation } = require('../middleware/handleValidation');
const registerRules = require('../validators/registerValidators');
const { sendMongooseError } = require('../utils/errorResponse');

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
    await Register.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Cập nhật trạng thái thành công!' });
  } catch (error) {
    sendMongooseError(res, error, 'Không thể xử lý yêu cầu thành viên');
  }
});


// GET /api/admin/members/tournament/:tournament_id - Lấy danh sách thành viên của một giải đấu
router.get('/tournament/:tournament_id', verifyToken, registerRules.membersByTournament, handleValidation, async (req, res) => {
  try {
      const { tournament_id } = req.params;
      const approvedRegistrations = await Register.find({ 
          tournament_id: tournament_id, 
          status: 'approved' 
      });
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
      const approvedRegistrations = await Register.find({ 
          tournament_id: tournament_id, 
          status: 'approved' 
      });
      res.json(approvedRegistrations);
  } catch (error) {
      console.error('Error fetching public members for tournament:', error);
      sendMongooseError(res, error, 'Không thể xử lý yêu cầu thành viên');
  }
});

module.exports = router;
