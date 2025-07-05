const tournament_model = require('../model/tournament');


/**
 * Function to create tournament
 * @param {Object} req.body includes tournament_id, tournament_name, game_name, start_date (set 'null' for default value), end_date (set 'null' for default value)
 * 
 * @returns {Object} JSON response with tournament data or error message
 * 
 * @example
 * // POST /api/admin/tournament/create-tournament
 */
const createTournament = async (req, res) => {
    console.log(req.body);
    
    const {
        req_tour_id,
        req_tour_name,
        req_game_name,
        req_start_date,
        req_end_date
    } = req.body;

    try {
        const tournament_data = {
            tournament_id: req_tour_id,
            tournament_name: req_tour_name,
            game_name: req_game_name,
            start_date: req_start_date,
            end_date: req_end_date
        };

        // If the values is null -> delete the value to automatically set the default value for this key
        Object.keys(tournament_data).forEach(
            key => (tournament_data[key] == null) && delete tournament_data[key]
        );

        const new_tournament = new tournament_model(tournament_data);

        await new_tournament.save();
        console.log('Tournament saved!');

        res.status(201).json({
            message: 'Tournament created!',
            data: new_tournament
        });
    } catch (error) {
        console.log('[ERROR][createTournament]: ', error);
        res.status(500).json({
            message: 'Failed to create!'
        });
    }
};


/**
 * Function to filter the tournaments by game name or date (start_date <= date <= end_date)
 * @param {Object} req.query includes game_name and date
 * 
 * @returns {Object} JSON response with list of filtered tournaments or error message
 * 
 * @example
 * // POST /api/admin/tournament/filter?game_name=EChess&date=2025-07-01
 */
const filterTournaments = async (req, res) => {
    const {
        game_name,
        date
    } = req.query;

    const filter = {};

    if (game_name) {
        filter.game_name = game_name;
    }

    if (date) {
        const filter_date = new Date(date);

        filter.start_date = {$lte: filter_date};
        filter.end_date = {$gte: filter_date};
    }

    try {
        const filtered_tournaments = await tournament_model.find(
            filter,
            {
                _id: false,
                __v: false
            }
        );
        
        res.status(200).json({
            data: filtered_tournaments
        });
    } catch (error) {
        console.log('[ERROR][filterTournaments]: ', error);
        res.status(500).json({
            message: 'Failed to fetch data'
        });
    }
};

module.exports = {createTournament, filterTournaments};