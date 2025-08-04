const tournament_model = require('../model/tournament');

/**
 * Function to create a tournament
 * @param {Object} req.body includes game, title, format, description, participants (array), start_date (nullable), end_date (nullable)
 * 
 * @example
 * // POST /api/admin/tournament/create-tournament
 */
const createTournament = async (req, res) => {
    const {
        id,
        image,
        game,
        title,
        format,
        description,
        participants,
        start_date,
        end_date
    } = req.body;

    try {
        // Kiểm tra id đã tồn tại chưa
        const existingTournament = await tournament_model.findOne({ id });
        if (existingTournament) {
            return res.status(409).json({
                message: `Tournament with id "${id}" already exists`
            });
        }

        const tournament_data = {
            id,
            image,
            game,
            title,
            format,
            description,
            participants,
            start_date,
            end_date
        };

        // Xoá field null để schema dùng default
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
            message: 'Failed to create tournament'
        });
    }
};

const getTournaments = async (req, res) => {
    try {
            const tournaments = await tournament_model.find({}, {_id: 0, __v: 0});
    
            const formatted_tournaments = tournaments.map(a => ({
                id: a.id,
                game: a.game,
                image: a.image,
                title: a.title,
                format: a.format,
                participants: a.participants,
                start_date: a.start_date.toLocaleDateString('en-GB'),
                end_date: a.end_date.toLocaleDateString('en-GB')
            }));
    
            res.status(200).json(formatted_tournaments);
        } catch (error) {
            console.log('[ERROR][getTournaments]:', error);
            res.status(500).json({
                message: 'Failed to fetch tournaments!'
            });
        }
};

const viewTournamentInformation = async (req, res) => {
    const {tournament_id} = req.params
    try {
        const tournament = await tournament_model.findOne({id: tournament_id}, {_id: 0, __v: 0, id:0});
    
        const formatted_tournaments = {
            id: tournament.id,
            game: tournament.game,
            image: tournament.image,
            title: tournament.title,
            format: tournament.format,
            participants: tournament.participants,
            start_date: tournament.start_date.toLocaleDateString('en-GB'),
            end_date: tournament.end_date.toLocaleDateString('en-GB')
        };

        res.status(200).json(formatted_tournaments);
    } catch (error) {
        console.log('[ERROR][viewTournamentInformation]:', error);
            res.status(500).json({
                message: 'Failed to fetch tournament\'s information!'
            });
    }
}

/**
 * Function to filter tournaments by game or a date inside tournament duration
 * @param {Object} req.query includes game and/or date (YYYY-MM-DD)
 * 
 * @example
 * // GET /api/admin/tournament/filter?game=Chess&date=2025-07-01
 */
const filterTournaments = async (req, res) => {
    const { game, date } = req.query;
    console.log('[DEBUG][filterTournaments]: ', game)
    try {
        const filter = {};

        if (game) {
            filter.game = game;
        }

        if (date) {
            const filter_date = new Date(date);
            filter.start_date = { $lte: filter_date };
            filter.end_date = { $gte: filter_date };
        }

        const results = await tournament_model.find(filter, {
            __v: false
        });

        console.log('Filtered tournaments fetched!');
        res.status(200).json({
            message: 'Tournaments fetched!',
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
    getTournaments,
    viewTournamentInformation,
    filterTournaments
};
