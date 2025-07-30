const express = require('express')
const user_router = express.Router()

const {
    createRegistration,
    getRegistersStatus
} = require('../controllers/registrationControllers');

const {
    filterTournaments
} = require('../controllers/tournamentControllers');

// Participants management
user_router.post('/registration/:tournament_id/participants', createRegistration);

user_router.get('/registration/:tournament_id/participants/:status', getRegistersStatus);


// Tournaments management
user_router.get('/tournament/filter', filterTournaments);

module.exports = user_router;