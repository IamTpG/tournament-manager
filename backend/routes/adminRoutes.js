const express = require('express');
const admin_router = express.Router();

const {
    verifyToken
} = require('../middleware/verifyToken');

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

const { handleValidation } = require('../middleware/handleValidation');
const tournamentRules = require('../validators/tournamentValidators');
const matchRules = require('../validators/matchValidators');
const contentRules = require('../validators/contentValidators');


// Highlights management
admin_router.post('/highlight', verifyToken, contentRules.createHighlight, handleValidation, createHighlight);

admin_router.get('/highlight', getAllHighlights);


// News management
admin_router.post('/news', verifyToken, contentRules.createNews, handleValidation, createNews);

admin_router.get('/news', getAllNews);


// Tournaments management
admin_router.get('/tournament', getTournaments);
admin_router.post('/tournament', verifyToken, tournamentRules.createTournament, handleValidation, createTournament);
admin_router.get('/tournament/filter', tournamentRules.filterTournaments, handleValidation, filterTournaments);
admin_router.get('/tournament/:tournament_id', tournamentRules.tournamentIdParam, handleValidation, viewTournamentInformation);
admin_router.put('/tournament/:tournament_id', verifyToken, tournamentRules.updateTournament, handleValidation, updateTournament);
admin_router.delete('/tournament/:tournament_id', verifyToken, tournamentRules.tournamentIdParam, handleValidation, deleteTournament);
admin_router.get('/tournament/:tournament_id/participants/count', tournamentRules.tournamentIdParam, handleValidation, countRegistersInTournament);

// Matches management
// API để tạo các match ban đầu (vòng 1) cho một giải đấu
admin_router.post('/tournament/:tournament_id/matches', verifyToken, tournamentRules.tournamentIdParam, handleValidation, createMatches);
// API để lấy tất cả các match của một giải đấu
admin_router.get('/tournament/:tournament_id/matches', tournamentRules.tournamentIdParam, handleValidation, getMatchesByTournament);
// API để tiến độ bảng đấu sang vòng tiếp theo cho một giải đấu
admin_router.post('/tournament/:tournament_id/advance-bracket', verifyToken, tournamentRules.tournamentIdParam, handleValidation, advanceTournamentBracket);
//API xóa tất cả trận đấu
admin_router.delete('/tournament/:tournament_id/matches/all', verifyToken, tournamentRules.tournamentIdParam, handleValidation, deleteAllMatchesForTournament);

admin_router.get('/match/:match_id', matchRules.matchIdParam, handleValidation, getMatchById);

// API cập nhật kết quả một match. Đăng ký ở CẢ hai đường dẫn vì frontend đang
// dùng dạng số nhiều (`/results`) còn dạng số ít tồn tại từ trước — cả hai phải
// được validate như nhau.
admin_router.put('/match/:match_id/results', verifyToken, matchRules.updateMatchResult, handleValidation, updateMatchResult);
admin_router.put('/match/:match_id/result', verifyToken, matchRules.updateMatchResult, handleValidation, updateMatchResult);

module.exports = admin_router;