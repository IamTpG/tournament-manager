const express = require('express')
const user_router = express.Router()

const {
    createRegistration,
    getRegistersStatus
} = require('../controllers/registrationControllers');

const {
    filterTournaments
} = require('../controllers/tournamentControllers');

const {
    getAllArticles,
    getArticlesByGame
} = require('../controllers/articleControllers');

const {
    getAllHighlights
} = require('../controllers/highlightControllers');


// Highlights management
user_router.get('highlight/get-highlights',getAllHighlights);


// Articles management
user_router.get('/article/get-all-articles',getAllArticles);

user_router.get('/article/get-articles-by-game',getArticlesByGame);


// Participants management
user_router.post('/registration/:tournament_id/participants', createRegistration);

user_router.get('/registration/:tournament_id/participants/:status', getRegistersStatus);


// Tournaments management
user_router.get('/tournament/filter', filterTournaments);


module.exports = user_router;