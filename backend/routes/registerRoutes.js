const express = require('express');
const router = express.Router();

const { v4: uuidv4 } = require('uuid');

const Register = require('../model/register.js');
const Tournament = require('../model/tournament.js');
const { handleValidation } = require('../middleware/handleValidation');
const registerRules = require('../validators/registerValidators');
const { sendMongooseError } = require('../utils/errorResponse');

// POST /api/register - Đăng ký thành viên mới
router.post('/', registerRules.createRegistration, handleValidation, async (req, res) => {
  try {
    const { full_name, personal_id, email, phone, name_in_tournament, tournament_id } = req.body;

    // Giải đấu phải tồn tại — trước đây có thể đăng ký vào một mã giải bất kỳ và
    // bản ghi mồ côi đó chỉ lộ ra khi tạo bracket không thấy người chơi nào.
    const tournament = await Tournament.findOne({ id: tournament_id });
    if (!tournament) {
      return res.status(404).json({ message: 'Giải đấu không tồn tại' });
    }

    // Chỉ lấy đúng các trường cho phép. Bản cũ spread `...req.body` nên người
    // đăng ký (endpoint công khai) có thể tự gửi `status: 'approved'` để tự duyệt
    // mình vào bracket, và ghi đè cả `id`/`_id` do server sinh ra.
    // `status` cố tình KHÔNG có ở đây: schema tự đặt mặc định 'pending'.
    const register = new Register({
      id: uuidv4(), // trước dùng Date.now() nên hai đăng ký cùng mili-giây bị trùng id
      full_name,
      personal_id,
      email,
      phone,
      name_in_tournament,
      tournament_id
    });

    await register.save();
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    console.error('[ERROR][createRegistration]:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Bạn đã đăng ký giải đấu này rồi' });
    }
    sendMongooseError(res, error, 'Đăng ký thất bại');
  }
});

module.exports = router;
