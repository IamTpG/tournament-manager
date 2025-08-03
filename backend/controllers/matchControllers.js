const match_model = require('../model/match');
const tournament_model = require('../model/tournament')
const register_model = require('../model/register');

/**
 * Create matches for a tournament with auto-detected players_per_match if missing.
 * 
 * @param {String} req.params.tournament_id
 * @param {Object} req.body includes:
 *   - game: e.g., "pubg", "tft", "echecs"
 *   - format: "ranking" | "1v1"
 *   - players_per_match: optional (will be auto-detected)
 */
const createMatches = async (req, res) => {
    const {tournament_id} = req.params;
    const {
        id
    } = req.body;

    try {
        // 1. Validate tournament existence
        const tournament = await tournament_model.findOne({ id: tournament_id }); 
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // 2. Fetch approved players
        const players = await register_model.find({
            tournament: tournament_id,
            status: 'approved'
        });

        if (players.length < tournament.participants) {
            const missing = tournament.participants - players.length;
            return res.status(400).json({ message: `Not enough approved players. Need ${missing} more.` });
        }

        const game = tournament.game.toLowerCase();
        const createdMatches = [];

        // 3. Game-specific match creation
        switch (game) {
            case 'pubg': {
                const playerIDs = players.map(p => p.id);
                const match = new match_model({
                    id: id,
                    tournament_ID: tournament_id,
                    format: tournament.format,
                    players: playerIDs,
                    results: playerIDs.map(pid => ({ player: pid }))
                });
                await match.save();
                createdMatches.push(match);
                break;
            }

            case 'tft': {
                const shuffled = players.sort(() => 0.5 - Math.random());
                const groupSize = 8;
                let matchIndex = 1;

                for (let i = 0; i < shuffled.length; i += groupSize) {
                    const group = shuffled.slice(i, i + groupSize);
                    const ids = group.map(p => p.id);
                    const matchID = `${id}_g${matchIndex}`;
                    const match = new match_model({
                        id: matchID,
                        tournament_ID: tournament_id,
                        format: tournament.format,
                        players: ids,
                        results: ids.map(pid => ({ player: pid }))
                    });
                    await match.save();
                    createdMatches.push(match);
                    matchIndex++;
                }
                break;
            }

            case 'street_fighter': {
                if (players.length % 2 !== 0) {
                    return res.status(400).json({ message: 'Street Fighter requires even number of players.' });
                }

                const shuffled = players.sort(() => 0.5 - Math.random());
                let matchIndex = 1;

                for (let i = 0; i < shuffled.length; i += 2) {
                    const pair = [shuffled[i], shuffled[i + 1]];
                    const ids = pair.map(p => p.id);
                    const matchID = `${id}_m${matchIndex}`;
                    const match = new match_model({
                        id: matchID,
                        tournament_ID: tournament_id,
                        format: tournament.format,
                        players: ids,
                        results: ids.map(pid => ({ player: pid }))
                    });
                    await match.save();
                    createdMatches.push(match);
                    matchIndex++;
                }
                break;
            }

            default: {
                return res.status(400).json({ message: `Unsupported game: ${game}` });
            }
        }

        console.log(`[MATCH CREATED] Total matches: ${createdMatches.length}`);
        res.status(201).json({
            message: 'Match(es) created successfully',
            data: createdMatches
        });

    } catch (error) {
        console.error('[ERROR][createMatches]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Split array into chunks of a given size.
 */
function splitIntoGroups(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

module.exports = {createMatches};
