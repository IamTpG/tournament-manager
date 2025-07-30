const express = require('express');
const admin_router = express.Router();
const {
    verifyToken
} = require('../middleware/verifyToken');


const {
    verifyRole
} = require('../middleware/verifyRole');

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


// Participants management
admin_router.get('/registration/:tournament_id/participants/:status', getRegistersByTournamentAndStatus);

admin_router.put('/registration/:tournament_id/participants', verifyToken, verifyRole('admin'), updateStatusOfRegister);


// Tournaments management
admin_router.get('/tournament/filter', filterTournaments);

admin_router.post('/tournament', verifyToken, verifyRole('admin'), createTournament);


// Matches management
admin_router.post('/:tournament_id/matches', verifyToken, verifyRole('admin'), createMatches);

module.exports = admin_router;