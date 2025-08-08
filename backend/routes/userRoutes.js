const express = require('express')
const user_router = express.Router()


const {
    createRegistration,
    getRegistersStatus
} = require('../controllers/registrationControllers');


const {
    getTournaments,
    viewTournamentInformation,
    filterTournaments,
    countRegistersInTournament
} = require('../controllers/tournamentControllers');


const {
    getAllNews
} = require('../controllers/newsControllers');


const {
    getAllHighlights
} = require('../controllers/highlightControllers');


// Highlights management
user_router.get('/highlight', getAllHighlights);


// News management
user_router.get('/news', getAllNews);


// Participants management
user_router.post('/registration/:tournament_id/participants', createRegistration);

user_router.get('/registration/:tournament_id/participants/:status', getRegistersStatus);


// Tournaments management
user_router.get('/tournament/filter', filterTournaments);
user_router.get('/tournament', getTournaments);
user_router.get('/tournament/:tournament_id', viewTournamentInformation);
user_router.get('/tournament/:tournament_id/participants/count', countRegistersInTournament);

module.exports = user_router;
