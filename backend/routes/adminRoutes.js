const express = require('express')
const admin_router = express.Router()

const {
    getRegistersByTournamentAndStatus,
    updateStatusOfRegister
} = require('../controllers/registrationControllers');

const {
    createTournament,
    filterTournaments
} = require('../controllers/tournamentControllers');

const {
    createMatches
} = require('../controllers/matchControllers');

admin_router.get('/registration/:tournament_id/:status', getRegistersByTournamentAndStatus);

admin_router.put('/registration/:tournament_id/update-status', updateStatusOfRegister);

admin_router.get('/tournament/filter', filterTournaments);

admin_router.post('/tournament/create-tournament', createTournament);

admin_router.post('/:tournament_id/matches/create-matches', createMatches);

module.exports = admin_router;