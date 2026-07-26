const express = require('express');
const router = express.Router();
const {
    login
} = require('../controllers/authControllers');

const { handleValidation } = require('../middleware/handleValidation');
const authRules = require('../validators/authValidators');

router.post('/login', authRules.login, handleValidation, login);

module.exports = router;