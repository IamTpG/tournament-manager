const tournament_model = require('../model/tournament');

/**
 * Function to create a tournament
 * @param {Object} req.body includes game, title, format, description, participants (array), start_date (nullable), end_date (nullable)
 * 
 * @example
 * // POST /api/admin/tournament/create-tournament
 */
const createTournament = async (req, res) => {
    console.log(req.body);

    const {
        game,
        title,
        format,
        description,
        participants,
        start_date,
        end_date
    } = req.body;

    try {
        const tournament_data = {
            game,
            title,
            format,
            description,
            participants,
            start_date,
            end_date
        };

        // Remove any fields that are null to trigger defaults in schema
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
            message: 'Failed to create tournament!'
        });
    }
};

/**
 * Function to filter tournaments by game or a date inside tournament duration
 * @param {Object} req.query includes game and/or date (YYYY-MM-DD)
 * 
 * @example
 * // GET /api/admin/tournament/filter?game=Chess&date=2025-07-01
 */
const filterTournaments = async (req, res) => {
    const { game, date } = req.query;

    const filter = {};

    if (game) filter.game = game;

    if (date) {
        const filter_date = new Date(date);
        filter.start_date = { $lte: filter_date };
        filter.end_date = { $gte: filter_date };
    }

    try {
        const results = await tournament_model.find(filter, {
            __v: false
        });

        res.status(200).json({
            data: results
        });
    } catch (error) {
        console.log('[ERROR][filterTournaments]: ', error);
        res.status(500).json({
            message: 'Failed to fetch tournaments!'
        });
    }
};

module.exports = {
    createTournament,
    filterTournaments
};
