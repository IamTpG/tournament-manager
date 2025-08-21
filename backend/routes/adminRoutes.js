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
    countRegistersInTournament,
} = require('../controllers/tournamentControllers');

const {
    createMatches,
    getMatchesByTournament,
    advanceTournamentBracket,
    deleteAllMatchesForTournament,
    getMatchById,
    updateMatchResult
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
// admin_router.post('/:tournament_id/matches', verifyToken, createMatches);
// admin_router.get('/:tournament_id/matches', getMatchesByTournament);

// API để tạo các match ban đầu (vòng 1) cho một giải đấu
admin_router.post('/tournament/:tournament_id/matches', verifyToken, createMatches);
// API để lấy tất cả các match của một giải đấu
admin_router.get('/tournament/:tournament_id/matches', getMatchesByTournament);
// API để cập nhật kết quả của một match cụ thể
admin_router.put('/match/:match_id/results', verifyToken, updateMatchResult);
// API để tiến độ bảng đấu sang vòng tiếp theo cho một giải đấu
admin_router.post('/tournament/:tournament_id/advance-bracket', verifyToken, advanceTournamentBracket);
//API xóa tất cả trận đấu
admin_router.delete('/tournament/:tournament_id/matches/all', verifyToken, deleteAllMatchesForTournament);

admin_router.get('/match/:match_id', getMatchById);

admin_router.put('/match/:match_id/result', verifyToken, updateMatchResult); 
module.exports = admin_router;