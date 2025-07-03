const express = require('express')
const user_router = express.Router()

const {
    createRegistration,
    getRegistersStatus
} = require('../controllers/registrationControllers');

user_router.post('/:tournament_id/register', createRegistration);

user_router.get('/:tournament_id/:status', getRegistersStatus);

module.exports = user_router;