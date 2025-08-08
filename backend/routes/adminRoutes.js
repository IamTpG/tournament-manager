const express = require('express');
const admin_router = express.Router();

const {
    verifyToken
} = require('../middleware/verifyToken');

const {
    getRegistersByTournamentAndStatus,
    updateStatusOfRegister
} = require('../controllers/registrationControllers');

const {
    createTournament,
    getTournaments,
    viewTournamentInformation,
    filterTournaments,
    updateTournament,
    deleteTournament,
    countRegistersInTournament
} = require('../controllers/tournamentControllers');

const {
    createMatches
} = require('../controllers/matchControllers');

const {
    createNews,
    getAllNews
} = require('../controllers/newsControllers');

const {
    createHighlight,
    getAllHighlights
} = require('../controllers/highlightControllers')


// Highlights management
admin_router.post('/highlight', verifyToken, createHighlight);

admin_router.get('/highlight', getAllHighlights);


// News management
admin_router.post('/news', verifyToken, createNews);

admin_router.get('/news', getAllNews);


// Participants management
admin_router.get('/registration/:tournament_id/participants/:status', getRegistersByTournamentAndStatus);

admin_router.put('/registration/:tournament_id/participants', verifyToken, updateStatusOfRegister);


// Tournaments management
admin_router.get('/tournament', getTournaments);
admin_router.post('/tournament', verifyToken, createTournament);
admin_router.get('/tournament/filter', filterTournaments);
admin_router.get('/tournament/:tournament_id', viewTournamentInformation);
admin_router.put('/tournament/:tournament_id', verifyToken, updateTournament);
admin_router.delete('/tournament/:tournament_id', verifyToken, deleteTournament);
admin_router.get('/tournament/:tournament_id/participants/count', countRegistersInTournament);

// Matches management
admin_router.post('/:tournament_id/matches', verifyToken, createMatches);

module.exports = admin_router;