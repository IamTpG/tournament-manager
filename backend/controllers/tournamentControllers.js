const tournament_model = require('../model/tournament');
const register_model = require('../model/register.js');
const { sendMongooseError } = require('../utils/errorResponse');

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
        sendMongooseError(res, error, 'Failed to create tournament');
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
        const tournament = await tournament_model.findOne({id: tournament_id}, {_id: 0, __v: 0});

        // Thiếu kiểm tra null ở đây khiến id không tồn tại trả về 500 thay vì 404.
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

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
    // console.log('[DEBUG][filterTournaments]: ', game)
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

        // console.log('Filtered tournaments fetched!');
        res.status(200).json({
            message: 'Tournaments fetched!',
            data: results
        });

    } catch (error) {
        console.log('[ERROR][filterTournaments]: ', error);
        sendMongooseError(res, error, 'Failed to fetch tournaments!');
    }
};

// Các trường được phép sửa. `id` cố tình KHÔNG nằm ở đây: nó là khoá join sang
// match.tournament_ID và register.tournament_id, đổi nó sẽ làm mồ côi toàn bộ
// trận đấu và đăng ký của giải.
const UPDATABLE_TOURNAMENT_FIELDS = [
    'image', 'game', 'title', 'format', 'description',
    'participants', 'start_date', 'end_date'
];

const updateTournament = async (req, res) => {
    const {tournament_id} = req.params;

    // Chỉ nhận các trường trong danh sách cho phép, thay vì $set nguyên req.body.
    const updated_data = {};
    for (const field of UPDATABLE_TOURNAMENT_FIELDS) {
        if (req.body[field] !== undefined) updated_data[field] = req.body[field];
    }

    if (Object.keys(updated_data).length === 0) {
        return res.status(400).json({ message: 'Không có trường hợp lệ nào để cập nhật' });
    }

    try {
        // Nếu chỉ gửi một trong hai mốc thời gian, đối chiếu với giá trị đang lưu
        // để không tạo ra giải kết thúc trước khi bắt đầu.
        if (updated_data.start_date || updated_data.end_date) {
            const current = await tournament_model.findOne({ id: tournament_id });
            if (!current) {
                return res.status(404).json({ message: 'Tournament not found' });
            }
            const start = new Date(updated_data.start_date || current.start_date);
            const end = new Date(updated_data.end_date || current.end_date);
            if (end < start) {
                return res.status(400).json({
                    message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'
                });
            }
        }

        const updated_tournament = await tournament_model.findOneAndUpdate(
            {id: tournament_id},       // Match by tournament id (not _id)
            {$set: updated_data},       // Update with new values
            // runValidators: mặc định findOneAndUpdate KHÔNG chạy validator, nên
            // trước đây participants: -500 vẫn được ghi dù schema có min: 2.
            {new: true, runValidators: true}
        );

        if (!updated_tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        res.status(200).json(updated_tournament);
    } catch (err) {
        console.error('[ERROR][updateTournament]:', err);
        sendMongooseError(res, err, 'Failed to update tournament');
    }
};
  
const deleteTournament = async (req, res) => {
    const {tournament_id} = req.params;
  
    try {
        const deleted = await tournament_model.findOneAndDelete({id: tournament_id});
    
        if (!deleted) {
            return res.status(404).json({message: 'Tournament not found'});
        }
  
        res.status(200).json({message: 'Tournament deleted successfully'});
    } catch (error) {
        console.error('[ERROR][deleteTournament]:', error);
        res.status(500).json({message: 'Failed to delete tournament'});
    }
};

const countRegistersInTournament = async (req, res) => {
    const {tournament_id} = req.params;
    try {
        const count = await register_model.countDocuments({tournament_id:tournament_id});
        res.json({current: count});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to count participants'});
    }
}

module.exports = {
    createTournament,
    getTournaments,
    viewTournamentInformation,
    filterTournaments,
    updateTournament,
    deleteTournament,
    countRegistersInTournament
};
