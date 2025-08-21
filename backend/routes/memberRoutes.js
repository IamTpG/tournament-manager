const express = require('express');
const router = express.Router();

const Register = require('../model/register');
const { verifyToken } = require('../middleware/verifyToken');

// GET /api/admin/members - Lấy danh sách thành viên
router.get('/', verifyToken, async (req, res) => {
  try {
    const members = await Register.find().sort({ register_date: -1 });
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error); // <--- this will show exact cause
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/members/:id/approve - Duyệt/từ chối thành viên
router.put('/:id/approve', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    await Register.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Cập nhật trạng thái thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET /api/admin/members/tournament/:tournament_id - Lấy danh sách thành viên của một giải đấu
router.get('/tournament/:tournament_id', verifyToken, async (req, res) => {
  try {
      const { tournament_id } = req.params;
      const approvedRegistrations = await Register.find({ 
          tournament_id: tournament_id, 
          status: 'approved' 
      });
      res.json(approvedRegistrations);
  } catch (error) {
      console.error('Error fetching approved members for tournament:', error);
      res.status(500).json({ message: error.message });
  }
});
module.exports = router;
