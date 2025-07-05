const match_model = require('../model/match')
const register_model = require('../model/register')

/**
 * Function to create match
 * @param {Object} req.body includes number of players need to create bracket
 * @param {Object} req.params includes tournament_id
 * 
 * @returns {Object} JSON response with matches data or error message
 * 
 * @example
 * // POST /api/admin/EChess/matches/create-matches
 */
const createMatches = async (req, res) => {
    const {
        number_of_players
    } = req.body;

    const tournament_id = req.params.tournament_id;

    try {
        const accepted_players = await register_model.find({
            tournament_id: tournament_id,
            status: 'accepted'
        }).limit(number_of_players);

        if (accepted_players.length < number_of_players) {
            return res.status(400).json({
                message: `Only ${accepted_players.length} accepted players found. Need at least ${number_of_players}.`
            })
        }

        const suffled_players = accepted_players
            .map(player => player._id)
            .sort(() => Math.random() - 0.5);

        const matches = [];

        // Pair players into matches
        for (let i = 0; i < suffled_players.length - 1; i += 2) {
            const match = new match_model({
                first_player: suffled_players[i],
                second_player: suffled_players[i + 1],
                tournament_id: tournament_id
            });

            await match.save();
            matches.push(match);
        }

        if (suffled_players.length % 2 !== 0) {
            console.log(`Player ${accepted_players[accepted_players.length - 1]} has no opponent and is removed automatically.`);
        }

        res.status(201).json({
            message: 'Bracket created!',
            data: matches
        });

    } catch (error) {
        console.log('[ERROR][createMatch]: ', error);
        res.status(500).json({
            message: 'Failed to create!'
        });
    }
};

module.exports = {createMatches};