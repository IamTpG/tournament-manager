const express = require('express');

const user_router = express.Router()

const Register = require('../model/register');

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

const {
    getMatchesByTournament
} = require('../controllers/matchControllers');

const { handleValidation } = require('../middleware/handleValidation');
const tournamentRules = require('../validators/tournamentValidators');
const { sendMongooseError } = require('../utils/errorResponse');


user_router.get('/tournament/:tournament_id/matches', tournamentRules.tournamentIdParam, handleValidation, getMatchesByTournament);

// Highlights management
user_router.get('/highlight', getAllHighlights);


// News management
user_router.get('/news', getAllNews);


// Tournaments management
user_router.get('/tournament/filter', tournamentRules.filterTournaments, handleValidation, filterTournaments);
user_router.get('/tournament', getTournaments);
user_router.get('/tournament/:tournament_id', tournamentRules.tournamentIdParam, handleValidation, viewTournamentInformation);
user_router.get('/tournament/:tournament_id/participants/count', tournamentRules.tournamentIdParam, handleValidation, countRegistersInTournament);
user_router.get('/tournament/:tournament_id/players_approved', tournamentRules.tournamentIdParam, handleValidation, async (req, res) => {
    try {
        const { tournament_id } = req.params;
        // Chỉ trả id + tên thi đấu. Trước đây endpoint công khai này trả nguyên
        // document đăng ký, lộ CCCD/email/số điện thoại của mọi người chơi.
        const approvedRegistrations = await Register.find(
            { tournament_id: tournament_id, status: 'approved' },
            { _id: 0, id: 1, name_in_tournament: 1 }
        );
        res.json(approvedRegistrations);
    } catch (error) {
        console.error('Error fetching public members for tournament:', error);
        sendMongooseError(res, error, 'Không thể tải danh sách người chơi');
    }
  });

module.exports = user_router;
