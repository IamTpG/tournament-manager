const match_model = require('../model/match');
const tournament_model = require('../model/tournament');
const register_model = require('../model/register');
const { v4: uuidv4 } = require('uuid'); // Thư viện để tạo ID duy nhất

/**
 * Hàm trợ giúp để tìm lũy thừa của 2 kế tiếp
 */
const getNextPowerOfTwo = (n) => {
    if (n === 0) return 1; // For 0 participants, consider 1 slot (effectively a bye)
    let power = 1;
    while (power < n) {
        power *= 2;
    }
    return power;
};

/**
 * Hàm tạo các trận đấu cho Vòng 1 của nhánh thắng (Winners' Bracket).
 * Xử lý BYE và tự động hoàn thành trận BYE.
 * @param {Array<Object>} players - Danh sách đối tượng người chơi (bao gồm id, name_in_tournament)
 * @param {string} tournamentId - ID của giải đấu
 * @param {string} format - Loại hình giải đấu (e.g., "Loại trực tiếp", "Loại lần 2")
 * @param {Date} occurenceDate - Ngày diễn ra trận đấu
 * @returns {Array<Object>} Danh sách các đối tượng match sẵn sàng để lưu vào DB cho vòng 1
 */
const generateRoundOneMatches = (players, tournamentId, format, occurenceDate) => {
    if (!players || players.length === 0) return [];

    const numActualParticipants = players.length;
    const nextPowerOfTwo = getNextPowerOfTwo(numActualParticipants);
    const numByes = nextPowerOfTwo - numActualParticipants;

    // Xáo trộn NGƯỜI CHƠI THẬT trước, rồi mới chia ra ai nhận BYE — đảm bảo mỗi
    // BYE luôn ghép với đúng 1 người chơi thật, không bao giờ có 2 BYE ghép với
    // nhau. Nếu 2 BYE ghép nhau, trận đó phải bị bỏ hoàn toàn, khiến vòng 1 tạo
    // ra ÍT hơn nextPowerOfTwo/2 người thắng — phá vỡ giả định "từ vòng 2 trở đi
    // bracket luôn sạch" mà toàn bộ phần tạo placeholder còn lại (vòng 2+ của
    // WB, và mọi vòng LB) đều dựa vào.
    const shuffledPlayers = [...players];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }

    const byeRecipients = shuffledPlayers.slice(0, numByes);
    const headToHeadPlayers = shuffledPlayers.slice(numByes); // luôn có số lượng chẵn

    const roundOneMatches = [];
    const firstRoundDate = new Date(occurenceDate);
    firstRoundDate.setHours(8, 0, 0, 0);

    // Các trận BYE: người chơi thật thắng tự động, không có đối thủ.
    for (const player of byeRecipients) {
        roundOneMatches.push({
            id: uuidv4(),
            tournament_ID: tournamentId,
            format: format,
            players: [player.id],
            results: [{ player: player.id, score: 1 }],
            occurence_day: firstRoundDate,
            round: 1,
            status: 'completed',
            bracket_type: 'winners'
        });
    }

    // Các trận đối đầu thật giữa những người chơi còn lại.
    for (let i = 0; i < headToHeadPlayers.length; i += 2) {
        const player1 = headToHeadPlayers[i];
        const player2 = headToHeadPlayers[i + 1];
        roundOneMatches.push({
            id: uuidv4(),
            tournament_ID: tournamentId,
            format: format,
            players: [player1.id, player2.id],
            results: [{ player: player1.id, score: 0 }, { player: player2.id, score: 0 }],
            occurence_day: firstRoundDate,
            round: 1,
            status: 'pending',
            bracket_type: 'winners'
        });
    }

    return roundOneMatches;
};


/**
 * Hàm tạo các match placeholder cho các vòng sau trong bracket.
 * Match placeholder có players rỗng, status 'pending'.
 * @param {number} roundNumber - Số vòng đấu
 * @param {number} numMatches - Số lượng match trong vòng này
 * @param {string} tournamentId - ID giải đấu
 * @param {string} format - Loại hình giải đấu
 * @param {string} bracketType - Loại nhánh ('winners', 'losers', 'grand_finals')
 * @param {Date} occurenceDate - Ngày diễn ra match
 * @returns {Array<Object>} Danh sách match placeholder
 */
const generatePlaceholderMatches = (roundNumber, numMatches, tournamentId, format, bracketType, occurenceDate) => {
    const matches = [];
    for (let i = 0; i < numMatches; i++) {
        matches.push({
            id: uuidv4(),
            tournament_ID: tournamentId,
            format: format,
            players: [], // Rỗng cho các match placeholder
            results: [],
            occurence_day: occurenceDate,
            round: roundNumber,
            status: 'pending',
            bracket_type: bracketType
        });
    }
    return matches;
};

// Hàm lấy các trận đấu theo ID giải đấu
const getMatchesByTournament = async (req, res) => {
    const { tournament_id } = req.params;
    try {
        const matches = await match_model.find({ tournament_ID: tournament_id })
                                        .sort({ round: 1, bracket_type: 1, occurence_day: 1 })
                                        .lean();
        if (!matches.length) {
            return res.status(404).json({ message: 'No matches found for this tournament' });
        }
        res.json(matches);
    } catch (error) {
        console.error('[ERROR][getMatchesByTournament]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Hàm tạo các trận đấu (cập nhật để tạo toàn bộ bracket)
const createMatches = async (req, res) => {
    const { tournament_id } = req.params;

    try {
        const tournament = await tournament_model.findOne({ id: tournament_id });
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Kiểm tra xem đã có match nào được tạo cho giải đấu này chưa
        const existingMatchesCount = await match_model.countDocuments({ tournament_ID: tournament_id });
        if (existingMatchesCount > 0) {
            return res.status(409).json({ message: 'Matches already generated for this tournament. Please delete existing matches to regenerate.' });
        }

        const approvedPlayers = await register_model.find({
            tournament_id: tournament_id, // Đảm bảo đúng trường tournament_id
            status: 'approved'
        }).select('id name_in_tournament');

        console.log(`[DEBUG:createMatches] Approved Players count: ${approvedPlayers.length}`);


        if (approvedPlayers.length === 0) {
            return res.status(400).json({ message: 'No approved players found for this tournament. Cannot create matches.' });
        }

        let allMatchesToInsert = [];
        const tournamentStartDate = new Date(tournament.start_date);
        tournamentStartDate.setHours(8, 0, 0, 0); // Đặt giờ mặc định cho match

        if (tournament.format === 'Xếp hạng') {
            if (approvedPlayers.length < 1) {
                return res.status(400).json({ message: 'Not enough players for a ranking tournament. Minimum 1 player required.' });
            }
            const playerIDs = approvedPlayers.map(p => p.id);
            const singleRankingMatch = {
                id: uuidv4(),
                tournament_ID: tournament_id,
                format: tournament.format,
                players: playerIDs,
                results: playerIDs.map(pid => ({ player: pid, score: 0 })),
                occurence_day: tournamentStartDate,
                round: 1,
                status: 'pending',
                bracket_type: 'winners' // Mặc định là winners cho dễ quản lý
            };
            allMatchesToInsert.push(singleRankingMatch);
        } else if (tournament.game.toLowerCase() === 'tft') {
            if (approvedPlayers.length < 8) {
                return res.status(400).json({ message: 'Not enough players for TFT tournament. Minimum 8 players per group required.' });
            }
            const shuffled = approvedPlayers.sort(() => 0.5 - Math.random());
            const groupSize = 8;
            
            for (let i = 0; i < shuffled.length; i += groupSize) {
                const group = shuffled.slice(i, i + groupSize);
                if (group.length === 0) continue; 
                
                const ids = group.map(p => p.id);
                const match = {
                    id: uuidv4(),
                    tournament_ID: tournament_id,
                    format: tournament.format,
                    players: ids,
                    results: ids.map(pid => ({ player: pid, score: 0 })),
                    occurence_day: tournamentStartDate,
                    round: 1, 
                    status: 'pending',
                    bracket_type: 'winners' 
                };
                allMatchesToInsert.push(match);
            }
        } else { // Loại trực tiếp hoặc Loại lần 2
            const numParticipants = approvedPlayers.length;
            const powerOfTwoSize = getNextPowerOfTwo(numParticipants);
            const numRoundsWB = Math.log2(powerOfTwoSize); // Số vòng trong nhánh thắng

            // 1. Tạo các match Vòng 1 (nhánh thắng)
            const roundOneMatches = generateRoundOneMatches(approvedPlayers, tournament_id, tournament.format, tournamentStartDate);
            allMatchesToInsert.push(...roundOneMatches);

            // 2. Tạo các match placeholder cho các vòng tiếp theo của nhánh thắng (WB)
            let currentNumMatchesWB = powerOfTwoSize / 2; // Số match ở vòng 1 WB
            for (let round = 2; round <= numRoundsWB; round++) {
                currentNumMatchesWB /= 2;
                if (currentNumMatchesWB < 1) break; 

                const nextRoundDate = new Date(tournamentStartDate);
                nextRoundDate.setDate(tournamentStartDate.getDate() + (round - 1) * 7); 

                allMatchesToInsert.push(...generatePlaceholderMatches(
                    round,
                    currentNumMatchesWB,
                    tournament_id,
                    tournament.format,
                    'winners',
                    nextRoundDate
                ));
            }

            // 3. Nếu là Loại lần 2 (Double Elimination), tạo thêm nhánh thua (LB) và chung kết tổng
            if (tournament.format === 'Loại lần 2') {
                // Số vòng nhánh thua - không bị ảnh hưởng bởi BYE, chỉ phụ thuộc powerOfTwoSize
                const numRoundsLB = Math.ceil(Math.log2(powerOfTwoSize)) * 2 - 2;

                // Số người thua thực tế ở WB vòng 1 (chỉ tính match 2 người chơi thật —
                // match BYE chỉ có 1 người chơi, thắng tự động, không tạo ra người thua).
                const wbRound1LosersCount = roundOneMatches.filter(m => m.players.length === 2).length;

                // Mô phỏng từng vòng LB theo đúng logic ghép nguồn của advanceTournamentBracket,
                // dùng số người thua WB vòng 1 THỰC TẾ thay vì công thức powerOfTwoSize/4 (vốn giả
                // định không có BYE) — để số placeholder tạo trước khớp với số thực sự cần khi advance.
                let winnersFromPrevLBRound = 0;
                for (let round = 1; round <= numRoundsLB; round++) {
                    let incomingPlayers;
                    if (round === 1) {
                        incomingPlayers = wbRound1LosersCount;
                    } else if (round % 2 !== 0) { // Vòng LB lẻ (>1): chỉ nhận người thắng vòng LB trước
                        incomingPlayers = winnersFromPrevLBRound;
                    } else { // Vòng LB chẵn: điểm gộp — người thắng vòng LB trước + người thua WB tương ứng
                        const wbSourceRound = round / 2 + 1;
                        // WB vòng >=2 luôn "sạch" (không bị ảnh hưởng bởi BYE ở vòng 1)
                        const wbSourceLosersCount = powerOfTwoSize / Math.pow(2, wbSourceRound);
                        incomingPlayers = winnersFromPrevLBRound + wbSourceLosersCount;
                    }

                    const matchesThisRound = Math.ceil(incomingPlayers / 2);
                    winnersFromPrevLBRound = matchesThisRound; // mỗi match (kể cả match lẻ tự thắng) tạo đúng 1 người thắng

                    if (matchesThisRound < 1) continue;

                    const nextRoundDate = new Date(tournamentStartDate);
                    nextRoundDate.setDate(tournamentStartDate.getDate() + (numRoundsWB + round - 1) * 7);

                    allMatchesToInsert.push(...generatePlaceholderMatches(
                        numRoundsWB + round, // LB rounds continue numbering after WB
                        matchesThisRound,
                        tournament_id,
                        tournament.format,
                        'losers',
                        nextRoundDate
                    ));
                }

                // Chung kết tổng (Grand Finals) - 1 match
                const grandFinalsRound = numRoundsWB + numRoundsLB + 1; 
                const grandFinalsDate = new Date(tournamentStartDate);
                grandFinalsDate.setDate(tournamentStartDate.getDate() + (grandFinalsRound - 1) * 7);

                allMatchesToInsert.push(...generatePlaceholderMatches(
                    grandFinalsRound,
                    1, 
                    tournament_id,
                    tournament.format,
                    'grand_finals',
                    grandFinalsDate
                ));
            }
        }

        if (allMatchesToInsert.length === 0) {
            return res.status(400).json({ message: 'No matches could be generated based on the provided data.' });
        }
        
        console.log(`[DEBUG:createMatches] Total matches to insert: ${allMatchesToInsert.length}`);
        await match_model.insertMany(allMatchesToInsert);
        console.log(`[DEBUG:createMatches] Successfully inserted ${allMatchesToInsert.length} matches.`);

        res.status(201).json({
            message: 'Full bracket structure generated successfully',
            data: allMatchesToInsert.map(match => ({
                id: match.id,
                tournament_ID: match.tournament_ID,
                players: match.players,
                occurence_day: match.occurence_day,
                round: match.round,
                bracket_type: match.bracket_type,
                status: match.status
            }))
        });

    } catch (error) {
        console.error('[ERROR][createMatches]: ', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'One or more match IDs already exist. Matches might have been generated already. Please retry or check data.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Cập nhật kết quả của một trận đấu.
 * Yêu cầu: Match ID, và mảng results [{player: 'playerID', score: N}]
 * @param {String} req.params.match_id
 * @param {Object} req.body includes:
 * - results: [{ player: String, score: Number }],
 * - status: String (optional, e.g., 'completed')
 */

/**
 * Lỗi có kèm mã trạng thái HTTP, dùng để dừng xử lý từ bất kỳ đâu trong
 * advanceTournamentBracket (kể cả từ trong vòng lặp) và trả về đúng response.
 */
class BracketAdvanceError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

/**
 * Xác định người thắng/thua cho từng match trong một vòng đấu ĐÃ hoàn thành.
 * Ném BracketAdvanceError nếu có match hòa, thiếu điểm, hoặc số người chơi không hợp lệ.
 */
const determineRoundOutcome = (matchesInRound) => {
    const winners = [];
    const losers = [];

    for (const match of matchesInRound) {
        if (match.players.length === 1) { // BYE hoặc tự động thắng
            winners.push(match.players[0]);
            continue;
        }

        if (match.players.length !== 2) {
            throw new BracketAdvanceError(400, `Unsupported player count (${match.players.length}) for winner determination in match ${match.id}.`);
        }

        const player1Result = match.results.find(r => r.player === match.players[0]);
        const player2Result = match.results.find(r => r.player === match.players[1]);

        if (!player1Result || !player2Result || typeof player1Result.score !== 'number' || typeof player2Result.score !== 'number') {
            throw new BracketAdvanceError(400, `Match ${match.id} has incomplete or invalid scores.`);
        }

        let winnerId, loserId;
        if (player1Result.score > player2Result.score) {
            winnerId = player1Result.player;
            loserId = player2Result.player;
        } else if (player2Result.score > player1Result.score) {
            winnerId = player2Result.player;
            loserId = player1Result.player;
        } else {
            throw new BracketAdvanceError(400, `Match ${match.id} ended in a draw. Please resolve the draw before advancing.`);
        }

        winners.push(winnerId);
        losers.push(loserId);
    }

    return { winners, losers };
};

/**
 * Ghép ngẫu nhiên danh sách người chơi vào các match placeholder trống đã tồn tại
 * sẵn (do createMatches tạo), trả về danh sách bulkWrite ops để cập nhật chúng.
 * Idempotent nhờ guard players:{$size:0} trên mỗi updateOne.
 */
const buildAdvancementOps = (sourcePlayerIds, placeholders) => {
    const expected = Math.ceil(sourcePlayerIds.length / 2);
    if (placeholders.length !== expected) {
        throw new BracketAdvanceError(500, `Bracket data inconsistency: expected ${expected} empty placeholder(s), found ${placeholders.length}.`);
    }

    const shuffled = [...sourcePlayerIds].sort(() => 0.5 - Math.random());
    const ops = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        const player1 = shuffled[i];
        const player2 = shuffled[i + 1] || null;
        const playersForMatch = player2 ? [player1, player2] : [player1];
        const placeholder = placeholders[Math.floor(i / 2)];

        ops.push({
            updateOne: {
                filter: { id: placeholder.id, players: { $size: 0 } },
                update: {
                    $set: {
                        players: playersForMatch,
                        results: playersForMatch.map(pid => ({ player: pid, score: 0 })),
                        status: playersForMatch.length === 1 ? 'completed' : 'pending'
                    }
                }
            }
        });
    }
    return ops;
};

/**
 * Tiến độ bảng đấu bằng cách quét toàn bộ trạng thái bracket mỗi lần gọi và điền
 * vào bất kỳ match placeholder nào đã đủ điều kiện tiên quyết (thay vì chỉ xử lý
 * "vòng hiện tại") — cho phép Nhánh Thắng và Nhánh Thua tiến độ đồng thời, độc lập
 * với thứ tự admin hoàn thành các trận đấu. An toàn khi gọi lặp lại nhiều lần.
 * @param {String} req.params.tournament_id
 */
const advanceTournamentBracket = async (req, res) => {
    const { tournament_id } = req.params;

    try {
        const tournament = await tournament_model.findOne({ id: tournament_id });
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found.' });
        }

        if (tournament.format !== 'Loại trực tiếp' && tournament.format !== 'Loại lần 2') {
            return res.status(400).json({ message: `Bracket advancement is not applicable for format: ${tournament.format}` });
        }

        const allMatches = await match_model.find({ tournament_ID: tournament_id }).lean();
        if (allMatches.length === 0) {
            return res.status(400).json({ message: 'No matches found. Please create the first round first.' });
        }

        const matchesByRound = new Map();
        for (const match of allMatches) {
            if (!matchesByRound.has(match.round)) matchesByRound.set(match.round, []);
            matchesByRound.get(match.round).push(match);
        }

        const numRoundsWB = Math.max(...allMatches.filter(m => m.bracket_type === 'winners').map(m => m.round));
        const lbRounds = allMatches.filter(m => m.bracket_type === 'losers').map(m => m.round);
        const numRoundsLB = lbRounds.length ? Math.max(...lbRounds) - numRoundsWB : 0;
        const grandFinalsMatch = allMatches.find(m => m.bracket_type === 'grand_finals');

        // --- Giải đấu đã kết thúc chưa? ---
        if (grandFinalsMatch && grandFinalsMatch.status === 'completed') {
            const { winners, losers } = determineRoundOutcome([grandFinalsMatch]);
            return res.status(200).json({ message: 'Tournament completed!', winner: winners[0], runnerUp: losers[0] });
        }

        if (tournament.format === 'Loại trực tiếp') {
            const finalRoundMatches = matchesByRound.get(numRoundsWB) || [];
            if (finalRoundMatches.length > 0 && finalRoundMatches.every(m => m.status === 'completed')) {
                const { winners } = determineRoundOutcome(finalRoundMatches);
                return res.status(200).json({ message: 'Tournament completed!', winner: winners[0] });
            }
        }

        // Tính kết quả từng vòng theo nhu cầu (lazy), có cache. Lazy để một vòng đã
        // "tiêu thụ" xong không bị xác thực lại mỗi lần gọi — nếu không, dữ liệu bất
        // thường ở một vòng cũ đã xong việc có thể chặn tiến độ ở các nhánh khác.
        const roundOutcomeCache = new Map();
        const getRoundOutcome = (round) => {
            if (roundOutcomeCache.has(round)) return roundOutcomeCache.get(round);
            const matches = matchesByRound.get(round) || [];
            const outcome = (matches.length > 0 && matches.every(m => m.status === 'completed'))
                ? determineRoundOutcome(matches)
                : null;
            roundOutcomeCache.set(round, outcome);
            return outcome;
        };

        const bulkOps = [];
        const roundsAdvanced = [];

        const stageAdvancement = (round, bracketType, sourcePlayerIds) => {
            const placeholders = (matchesByRound.get(round) || []).filter(m => m.players.length === 0);
            if (placeholders.length === 0) return; // đã được điền hoặc chưa tồn tại
            const ops = buildAdvancementOps(sourcePlayerIds, placeholders);
            bulkOps.push(...ops);
            if (ops.length > 0) roundsAdvanced.push({ round, bracket_type: bracketType, matchesFilled: ops.length });
        };

        // --- Nhánh Thắng (Winners' Bracket): luôn an toàn để tự động ghép vòng tiếp theo ---
        for (let r = 1; r < numRoundsWB; r++) {
            const outcome = getRoundOutcome(r);
            if (!outcome) continue; // vòng r chưa hoàn thành, chưa có gì để đẩy tiếp
            stageAdvancement(r + 1, 'winners', outcome.winners);
        }

        // --- Nhánh Thua (Losers' Bracket) / Chung kết tổng: chỉ áp dụng cho Loại lần 2 ---
        if (tournament.format === 'Loại lần 2') {
            for (let r = 1; r <= numRoundsLB; r++) {
                const overallRound = numRoundsWB + r;
                let sourcePlayers;

                if (r === 1) {
                    // Vòng LB đầu tiên: chỉ cần người thua từ WB vòng 1 (nguồn duy nhất).
                    const wbRound1 = getRoundOutcome(1);
                    if (!wbRound1) continue;
                    sourcePlayers = wbRound1.losers;
                } else if (r % 2 !== 0) {
                    // Vòng LB lẻ (>1): chỉ tiến từ người thắng vòng LB trước, không gộp WB.
                    const prevLB = getRoundOutcome(overallRound - 1);
                    if (!prevLB) continue;
                    sourcePlayers = prevLB.winners;
                } else {
                    // Vòng LB chẵn: điểm gộp — cần CẢ người thắng vòng LB trước LẪN người
                    // thua của vòng WB tương ứng (round r/2+1). Chờ đủ cả 2, không quan
                    // trọng thứ tự admin hoàn thành trước.
                    const prevLB = getRoundOutcome(overallRound - 1);
                    const wbSource = getRoundOutcome(r / 2 + 1);
                    if (!prevLB || !wbSource) continue;
                    sourcePlayers = [...prevLB.winners, ...wbSource.losers];
                }

                stageAdvancement(overallRound, 'losers', sourcePlayers);
            }

            // --- Chung kết tổng: cần CẢ nhà vô địch WB LẪN nhà vô địch LB ---
            if (grandFinalsMatch && grandFinalsMatch.players.length === 0) {
                const wbFinal = getRoundOutcome(numRoundsWB);
                if (wbFinal) {
                    let lbChampion = null;
                    if (numRoundsLB === 0) {
                        // Giải đấu 2 người chơi: không có vòng LB nào, người thua WB vòng 1
                        // (cũng là chung kết WB) chính là nhà vô địch LB trực tiếp.
                        lbChampion = wbFinal.losers[0];
                    } else {
                        const lbFinal = getRoundOutcome(numRoundsWB + numRoundsLB);
                        if (lbFinal) lbChampion = lbFinal.winners[0];
                    }
                    if (lbChampion) {
                        stageAdvancement(grandFinalsMatch.round, 'grand_finals', [wbFinal.winners[0], lbChampion]);
                    }
                }
            }
        }

        if (bulkOps.length === 0) {
            // Nếu không có match nào được cập nhật, có thể giải đấu đã hoàn thành hoặc đang chờ thêm kết quả
            return res.status(200).json({ message: 'No new matches updated for the next round. Tournament might be completed or awaiting more results.' });
        }

        await match_model.bulkWrite(bulkOps);

        console.log(`[BRACKET ADVANCED] Updated ${bulkOps.length} matches for tournament ${tournament_id}`);
        res.status(200).json({
            message: 'Bracket advanced.',
            updatedCount: bulkOps.length,
            roundsAdvanced
        });

    } catch (error) {
        if (error instanceof BracketAdvanceError) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error('[ERROR][advanceTournamentBracket]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Xóa một match cụ thể theo tournament_id và match_id.
 * @param {String} req.params.tournament_id
 * @param {String} req.params.match_id
 */
const deleteMatch = async (req, res) => {
    const { tournament_id, match_id } = req.params; 
    try {
        const result = await match_model.deleteOne({ tournament_ID: tournament_id, id: match_id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Match not found for this tournament.' });
        }
        res.status(200).json({ message: 'Match deleted successfully.' });
    } catch (error) {
        console.error('[ERROR][deleteMatch]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Xóa TẤT CẢ các match thuộc một giải đấu cụ thể.
 * KHUYẾN CÁO: Chỉ sử dụng trong môi trường phát triển hoặc với sự cẩn trọng cao!
 * @param {String} req.params.tournament_id
 */
const deleteAllMatchesForTournament = async (req, res) => {
    const { tournament_id } = req.params;
    try {
        const result = await match_model.deleteMany({ tournament_ID: tournament_id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No matches found to delete for this tournament.' });
        }
        res.status(200).json({ message: `Successfully deleted ${result.deletedCount} matches for tournament ${tournament_id}.` });
    } catch (error) {
        console.error('[ERROR][deleteAllMatchesForTournament]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getMatchById = async (req, res) => {
    const { match_id } = req.params;
    try {
        const match = await match_model.findOne({ id: match_id }).lean();
        if (!match) {
            return res.status(404).json({ message: 'Match not found.' });
        }
        res.json(match);
    } catch (error) {
        console.error('[ERROR][getMatchById]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateMatchResult = async (req, res) => {
    const { match_id } = req.params;
    const { results, status, highlightLink, notes } = req.body;

    try {
        const match = await match_model.findOne({ id: match_id });
        if (!match) {
            return res.status(404).json({ message: 'Match not found.' });
        }

        if (!Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ message: 'Results must be a non-empty array.' });
        }
        
        // Validate results: ensure all players in the match have a corresponding result
        // And that score is a number, and player ID exists in match.players
        for (const resItem of results) {
            if (!match.players.includes(resItem.player) || typeof resItem.score !== 'number') {
                return res.status(400).json({ message: `Invalid player ID or score in results for player ${resItem.player}.` });
            }
        }
        
        // Update match fields
        match.results = results;
        if (status) {
            match.status = status;
        } else {
            // Auto-set status to 'completed' if all players have scores
            const allPlayersScored = match.players.every(pId => results.some(r => r.player === pId && typeof r.score === 'number'));
            if (allPlayersScored && match.players.length > 0) { 
                 match.status = 'completed';
            }
        }

        // Trận đấu loại trực tiếp 1-đấu-1 không được kết thúc hòa — nếu hòa, phải nhập
        // điểm số quyết định (theo cách tiebreaker thực tế đã diễn ra), không cho lưu ở đây.
        if (match.status === 'completed' && match.players.length === 2) {
            const tournament = await tournament_model.findOne({ id: match.tournament_ID });
            if (tournament && (tournament.format === 'Loại trực tiếp' || tournament.format === 'Loại lần 2')) {
                const player1Result = results.find(r => r.player === match.players[0]);
                const player2Result = results.find(r => r.player === match.players[1]);
                if (player1Result && player2Result && player1Result.score === player2Result.score) {
                    return res.status(400).json({
                        message: 'This match cannot end in a draw. Please enter a decisive score reflecting how the tie was actually resolved (e.g. a tiebreaker or playoff).'
                    });
                }
            }
        }

        // Cập nhật các trường mới
        if (highlightLink !== undefined) {
            match.highlight_link = highlightLink;
        }
        if (notes !== undefined) {
            match.notes = notes;
        }

        await match.save();
        res.json({ message: 'Match result updated successfully', data: match });

    } catch (error) {
        console.error('[ERROR][updateMatchResult]: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createMatches,
    getMatchesByTournament,
    advanceTournamentBracket,
    deleteMatch,
    deleteAllMatchesForTournament,
    getMatchById,
    updateMatchResult
};
