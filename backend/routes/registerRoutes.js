const express = require('express');
const router = express.Router();

const Register = require('../model/register.js');

// POST /api/register - Đăng ký thành viên mới
router.post('/', async (req, res) => {
  try {
    const register = new Register({
      id: new Date().getTime().toString(),
      ...req.body
    });
    await register.save();
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
