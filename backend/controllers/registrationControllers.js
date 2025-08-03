const register_model = require('../model/register'); // Get model to access database
const tournament_model = require('../model/tournament')
/**
 * Function to create registration
 * @param {Object} req.body includes full_name, phone_number, email, name_in_tournament, status (set 'null' for default value), registed_date (set 'null' for default value)
 * @param {Object} req.params includes tournament_id
 * 
 * @returns {Object} JSON response with register data or error message
 * 
 * @example
 * // POST /api/registration/:tournament_id/register
 */
const createRegistration = async (req, res) => {
    try {
        const players = req.body;
        const {
            tournament_id
        } = req.params;

        console.log('[DEBUG][createRegistration]: tournament_id = ', tournament_id);

        if (!Array.isArray(players)) {
            return res.status(400).json({ message: 'Expected an array of players' });
        }

        const results = [];

        for (const playerData of players) {
            const {id, full_name, phone, personal_id, email, name_in_tournament} = playerData;

            // Validate required fields
            if (!id || !tournament_id) {
                results.push({ id, status: 'failed', reason: 'Missing id or tournament' });
                continue;
            }

            // Check if tournament exists
            const existingTournament = await tournament_model.findOne({ id: tournament_id });
            if (!existingTournament) {
                results.push({ id, status: 'failed', reason: 'Tournament not found' });
                continue;
            }

            // Check if player already registered for this tournament
            const existingPlayer = await register_model.findOne({ id, tournament_id });
            if (existingPlayer) {
                results.push({ id, status: 'failed', reason: 'Player already exists in tournament' });
                continue;
            }

            // Create and save new player
            const newPlayer = new register_model({
                id,
                full_name,
                personal_id,
                phone,
                email,
                name_in_tournament,
                tournament: tournament_id,
                register_date: new Date()  // optional: new Date() or undefined to let schema handle
            });

            await newPlayer.save();
            results.push({ id, status: 'success' });
        }

        res.status(207).json({
            message: 'Processed players',
            results
        });

    } catch (error) {
        console.error('[ERROR][createMultiplePlayers]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Function to get the registers by status (admin)
 * @param {Object} req.params includes tournament_id, status ('all', 'pending', 'accepted', 'denied')
 * 
 * @returns {Object} JSON response with list of registers or error message
 * 
 * @example
 * // GET /api/admin/registration/EChess/denied 
 */
const getRegistersByTournamentAndStatus = async (req, res) => {
    const { tournament_id, status } = req.params;
    console.log('[DEBUG]: tournament_id =', tournament_id);
    console.log('[DEBUG]: status =', status);

    // Trạng thái hợp lệ
    const status_valid_values = ['all', 'pending', 'approved', 'denied'];
    if (!status_valid_values.includes(status)) {
        return res.status(400).json({
            message: 'Invalid value of status'
        });
    }

    try {
        const filter = { tournament: tournament_id };
        if (status !== 'all') {
            filter.status = status;
        }

        const players = await register_model.find(filter, {
            _id: 0,
            __v: 0,
            tournament: 0
        });

        console.log('[DEBUG]:', players);

        const formatted = players.map(p => ({
            full_name: p.full_name,
            phone: p.phone,
            id: p.id,
            email: p.email,
            name_in_tournament: p.name_in_tournament,
            register_date: p.register_date?.toLocaleDateString('en-GB') || null
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error('[ERROR][getRegistersByTournamentAndStatus]: ', error);
        res.status(500).json({
            message: 'Failed to fetch data'
        });
    }
};


/**
 * Function to update a status of a register by using personal ID
 * @param {Object} req.params includes tournament_id
 * @param {Object} req.body includes personal_id, status
 * 
 * @returns {Object} JSON response with a data of updated register or error message
 * 
 * @example
 * // PUT api/admin/registration/EChess/update-status
 */
const updateStatusOfRegister = async (req, res) => {
    const {req_tournament_id} = req.params;
    const {req_id, req_status} = req.body;

    // Check the value of status
    const status_valid_values = ['pending', 'approved', 'denied'];
    if (status_valid_values.includes(req_status) === false) {
        return res.status(400).json({
            message: 'Invalid value of status'
        });
    }

    try {
        const updated_register = await register_model.findOneAndUpdate (
            {tournament_id: req_tournament_id, id: req_id},
            {$set: {status: req_status}},
            {new: true}
        );

        if (updated_register) {
            res.status(200).json({
                message: `Register with ID ${req_id} updated successfully`,
                data: updated_register
            });
        } else {
            res.status(404).json({
                message: 'Not Found Register'
            });
        }

    } catch (error) {
        console.log('[ERROR][updateStatusOfRegister]: ', error);
        res.status(500).json({
            message: 'Failed to update status'
        });
    }
};

/**
 * Function to get the registers by status (user)
 * @param {Object} req.params includes tournament_id, status ('all', 'pending', 'accepted', 'denied')
 * 
 * @returns {Object} JSON response with list of registers or error message
 * 
 * @example
 * // GET /api/admin/registration/EChess/denied 
 */
const getRegistersStatus = async (req, res) => {
    const {
        tournament_id,
        status
    } = req.params;

    try {
        let registrations = null;
        if (status === 'all') {
            registrations = await register_model.find(
                {
                    tournament: tournament_id
                },
                {
                    full_name: 1,
                    name_in_tournament: 1,
                    _id: 0
                });
        } else {
            registrations = await register_model.find(
                {
                    tournament: tournament_id,
                    status: status
                },
                {
                    full_name: 1,
                    name_in_tournament: 1,
                    _id: 0
                });
        }

        if (registrations.length > 0) {
            res.status(200).json({
                data: registrations
            });
        } else {
            res.status(404).json({
                message: 'Not Found Register'
            });
        }
    } catch (error) {
        console.log('[ERROR][getRegistersStatus]: ', error);
        res.status(500).json({
            message: 'Failed to fetch status'
        });
    }
}

module.exports = {createRegistration, getRegistersByTournamentAndStatus, updateStatusOfRegister, getRegistersStatus};