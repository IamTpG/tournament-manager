const register_model = require('../model/register'); // Get model to access database

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
    const {
        req_full_name,
        req_phone_number,
        req_personal_id,
        req_email,
        req_name_in_tournament,
        req_status,
        req_registered_date
    } = req.body;

    const req_tournament_id = req.params.tournament_id;

    try {
        const new_registration = new register_model({
            tournament_id: req_tournament_id,
            full_name: req_full_name,
            phone_number: req_phone_number,
            personal_id: req_personal_id,
            email: req_email,
            name_in_tournament: req_name_in_tournament,
            status: req_status,
            registered_date: req_registered_date
        });

        // If the values is null -> delete the value to automatically set the default value for this key
        Object.keys(new_registration).forEach(
            key => (new_registration[key] == null) && delete new_registration[key]
        );

        await new_registration.save();
        console.log('Registration saved!')

        res.status(201).json({
            message: 'Registration submitted!',
            data: new_registration
        });
    } catch (error) {
        console.log('[ERROR][createRegistration]: ', error);
        res.status(500).json({
            message: 'Failed to register!'
        });
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
    const {tournament_id, status} = req.params;

    // Check the value of status
    const status_valid_values = ['all', 'pending', 'accepted', 'denied'];
    if (status_valid_values.includes(status) === false) {
        return res.status(400).json({
            message: 'Invalid value of status'
        });
    }

    try {
        let filtered_registers = null;
        if (status === 'all') {
            filtered_registers = await register_model.find({
                tournament_id: tournament_id
            },
            {
                _id: false,
                __v: false,
                tournament_id: false
            });
        } else {
            filtered_registers = await register_model.find({
                tournament_id: tournament_id,
                status: status
            },
            {
                _id: false,
                __v: false,
                tournament_id: false
            });
        }

        const formatted_filtered_registers = filtered_registers.map(reg => ({
            full_name: reg.full_name,
            phone_number: reg.phone_number,
            personal_id: reg.personal_id,
            email: reg.email,
            name_in_tournament: reg.name_in_tournament,
            registered_date: reg.registered_date.toLocaleDateString('en-GB')
        }));

        res.status(200).json(formatted_filtered_registers);
    } catch(error) {
        console.log('[ERROR][getRegistersByTournamentAndStatus]: ', error);
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
    const req_tournament_id = req.params.tournament_id;
    const {req_personal_id, req_status} = req.body;

    // Check the value of status
    const status_valid_values = ['pending', 'accepted', 'denied'];
    if (status_valid_values.includes(req_status) === false) {
        return res.status(400).json({
            message: 'Invalid value of status'
        });
    }

    try {
        const updated_register = await register_model.findOneAndUpdate (
            {tournament_id: req_tournament_id, personal_id: req_personal_id},
            {$set: {status: req_status}}
        )

        if (updated_register) {
            res.status(200).json({
                message: `Register with ID ${req_personal_id} updated successfully`,
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
                    tournament_id: tournament_id
                },
                {
                    full_name: true,
                    name_in_tournament: true,
                    _id: false
                });
        } else {
            registrations = await register_model.find(
                {
                    tournament_id: tournament_id,
                    status: status
                },
                {
                    full_name: true,
                    name_in_tournament: true,
                    _id: false
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