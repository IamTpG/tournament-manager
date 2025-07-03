const tournament_model = require('../model/tournament');


/**
 * Function to filter tournament by date and game name
 * with endpoints /filter
 */
const filterTournament = async (req, res) => {
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
                _id: false
            }
        );
        
        res.status(200).json({
            data: filtered_tournaments
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch data'
        });
    }
};

module.exports = {filterTournament};