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


user_router.get('/tournament/:tournament_id/matches', getMatchesByTournament);

// Highlights management
user_router.get('/highlight', getAllHighlights);


// News management
user_router.get('/news', getAllNews);


// Tournaments management
user_router.get('/tournament/filter', filterTournaments);
user_router.get('/tournament', getTournaments);
user_router.get('/tournament/:tournament_id', viewTournamentInformation);
user_router.get('/tournament/:tournament_id/participants/count', countRegistersInTournament);
user_router.get('/tournament/:tournament_id/players_approved', async (req, res) => {
    try {
        const { tournament_id } = req.params;
        const approvedRegistrations = await Register.find({ 
            tournament_id: tournament_id, 
            status: 'approved' 
        });
        res.json(approvedRegistrations);
    } catch (error) {
        console.error('Error fetching public members for tournament:', error);
        res.status(500).json({ message: error.message });
    }
  });

module.exports = user_router;
