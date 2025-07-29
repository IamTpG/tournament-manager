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

const {
    createArticle,
    getAllArticles,
    getArticlesByGame
} = require('../controllers/articleControllers');

const {
    createHighlight,
    getAllHighlights
} = require('../controllers/highlightControllers')
admin_router.post('highlight/create-highlight',createHighlight);

admin_router.get('highlight/get-highlights',getAllHighlights);

admin_router.post('/article/create-article',createArticle);

admin_router.get('/article/get-all-articles',getAllArticles);

admin_router.get('/article/get-articles-by-game',getArticlesByGame);

admin_router.get('/registration/:tournament_id/:status', getRegistersByTournamentAndStatus);

admin_router.put('/registration/:tournament_id/update-status', updateStatusOfRegister);

admin_router.get('/tournament/filter', filterTournaments);

admin_router.post('/tournament/create-tournament', createTournament);

admin_router.post('/:tournament_id/matches/create-matches', createMatches);


admin_router.post('/:tournament_id/matches/create-matches', createMatches);


module.exports = admin_router;