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


user_router.get('highlight/get-highlights',getAllHighlights);

user_router.get('/article/get-all-articles',getAllArticles);

user_router.get('/article/get-articles-by-game',getArticlesByGame);

user_router.post('/registration/:tournament_id/register', createRegistration);

user_router.get('/registration/:tournament_id/:status', getRegistersStatus);

user_router.get('/tournament/filter', filterTournaments);

module.exports = user_router;