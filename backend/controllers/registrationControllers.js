const register_model = require('../model/register'); // Get model to access database

/**
 * Function to take and save registration data
 */
const createRegistration = async (req, res) => {
    const {
        req_full_name,
        req_phone_number,
        req_personal_id,
        req_email,
        req_name_in_tournament
    } = req.body;

    const req_tournament_id = req.params.tournament_id;

    try {
        const registration = new register_model({
            tournament_id: req_tournament_id,
            full_name: req_full_name,
            phone_number: req_phone_number,
            personal_id: req_personal_id,
            email: req_email,
            name_in_tournament: req_name_in_tournament,
            status: 'pending',
            registered_date: Date.now()
        });

        await registration.save();
        console.log('Saved!')
        res.status(201).json({
            message: 'Registration submitted',
            data: registration
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to register'
        });
    }
};

/**
 * Function to get the registers from database by using tournament ID and status
 * with endpoints /:tournament_id/registration/:status
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
        res.status(500).json({
            message: 'Failed to fetch data'
        });
    }
};


/**
 * Function to update a status of a register by tournament ID and personal ID
 * with endpoints /:tournament_id/status
 */
const updateStatusOfRegisters = async (req, res) => {
    const tournament_id_field = req.params.tournament_id;
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
            {tournament_id: tournament_id_field, personal_id: req_personal_id},
            {$set: {status: req_status}}
        )

        if (updated_register) {
            res.status(200).json({
                message: `Register with ID ${req_personal_id} updated successfully`,
                // data: updated_register
            });
        } else {
            res.status(404).json({
                message: 'Not Found Register'
            });
        }

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update status'
        });
    }
};

/**
 * Function to view all the registers' status in a tournament
 * with endpoints /:tournament_id/:status
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
        res.status(500).json({
            message: 'Failed to fetch status'
        });
    }
}

module.exports = {createRegistration, getRegistersByTournamentAndStatus, updateStatusOfRegisters, getRegistersStatus};