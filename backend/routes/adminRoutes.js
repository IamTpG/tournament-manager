const express = require('express')
const admin_router = express.Router()

const {
    getRegistersByTournamentAndStatus,
    updateStatusOfRegisters
} = require('../controllers/registrationControllers');

const {
    filterTournament
} = require('../controllers/tournamentControllers');

admin_router.get('/registration/:tournament_id/:status', getRegistersByTournamentAndStatus);

admin_router.put('/registration/:tournament_id/status/', updateStatusOfRegisters);

admin_router.get('/tournament/filter', filterTournament);

module.exports = admin_router;