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

    let currentPlayers = [...players]; 

    // Thêm các BYE players để đủ số lượng lũy thừa của 2
    for (let i = 0; i < numByes; i++) {
        currentPlayers.push({ id: `BYE_PLAYER_${uuidv4()}`, name_in_tournament: 'BYE' }); 
    }
    
    console.log(`[DEBUG:generateRoundOneMatches] Initial players count: ${players.length}`);
    console.log(`[DEBUG:generateRoundOneMatches] nextPowerOfTwo: ${nextPowerOfTwo}, numByes: ${numByes}`);
    console.log(`[DEBUG:generateRoundOneMatches] currentPlayers after BYE padding: ${currentPlayers.length}`);

    // Xáo trộn ngẫu nhiên danh sách người chơi
    for (let i = currentPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentPlayers[i], currentPlayers[j]] = [currentPlayers[j], currentPlayers[i]];
    }

    const roundOneMatches = [];
    const firstRoundDate = new Date(occurenceDate);
    firstRoundDate.setHours(8, 0, 0, 0); 

    // Loop through pairs to create matches
    for (let i = 0; i < currentPlayers.length; i += 2) {
        const player1Obj = currentPlayers[i];
        // Ensure player2Obj is defined. If no player2, it implies a bye for player1.
        // This 'ghost' BYE is just for internal pairing logic if numParticipants is odd.
        const player2Obj = currentPlayers[i + 1] || { id: `BYE_PLAYER_GHOST_${uuidv4()}`, name_in_tournament: 'BYE' };

        const playerIDsInMatch = [];
        const initialResults = [];
        let matchStatus = 'pending';

        const isPlayer1Bye = player1Obj.name_in_tournament === 'BYE';
        const isPlayer2Bye = player2Obj.name_in_tournament === 'BYE';

        if (isPlayer1Bye && isPlayer2Bye) {
            // This case should ideally not happen if numActualParticipants >= 1 and BYEs are correctly handled.
            // If it does, it means a truly empty match slot. We skip creating it.
            console.warn("Skipping match creation: Both players are BYE. This indicates an issue with player padding or participant count.");
            continue; 
        } else if (isPlayer1Bye) {
            // Player 2 is a real player, Player 1 is BYE. Player 2 advances.
            playerIDsInMatch.push(player2Obj.id); 
            initialResults.push({ player: player2Obj.id, score: 1 });
            initialResults.push({ player: player1Obj.id, score: 0 }); // BYE player "loses"
            matchStatus = 'completed'; 
        } else if (isPlayer2Bye) {
            // Player 1 is a real player, Player 2 is BYE. Player 1 advances.
            playerIDsInMatch.push(player1Obj.id); 
            initialResults.push({ player: player1Obj.id, score: 1 });
            initialResults.push({ player: player2Obj.id, score: 0 }); // BYE player "loses"
            matchStatus = 'completed';
        } else {
            // Both are real players. Regular match.
            playerIDsInMatch.push(player1Obj.id);
            playerIDsInMatch.push(player2Obj.id);
            initialResults.push({ player: player1Obj.id, score: 0 });
            initialResults.push({ player: player2Obj.id, score: 0 });
            matchStatus = 'pending';
        }

        roundOneMatches.push({
            id: uuidv4(),
            tournament_ID: tournamentId,
            format: format,
            players: playerIDsInMatch, // This will be `[real_player_id]` for BYE matches or `[p1_id, p2_id]` for regular matches
            results: initialResults,
            occurence_day: firstRoundDate,
            round: 1,
            status: matchStatus,
            bracket_type: 'winners'
        });
    }
    console.log(`[DEBUG:generateRoundOneMatches] Matches generated for Round 1: ${roundOneMatches.length}`);
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
                // Số vòng nhánh thua ước tính. Có nhiều cách tính, đây là một cách đơn giản hóa.
                const numRoundsLB = Math.ceil(Math.log2(powerOfTwoSize)) * 2 - 2; 
                
                // Số match ban đầu trong nhánh thua (khi người thua từ WB round 1, 2 rơi xuống)
                let numMatchesInLosersRound = powerOfTwoTwoSize / 4; 

                for (let round = 1; round <= numRoundsLB; round++) {
                    let matchesThisRound;
                    if (round % 2 !== 0) { // Odd rounds of LB (e.g., LB R1, LB R3)
                        matchesThisRound = numMatchesInLosersRound;
                    } else { // Even rounds of LB (e.g., LB R2, LB R4)
                        matchesThisRound = numMatchesInLosersRound; 
                        numMatchesInLosersRound /= 2; // Number of matches halves every two LB rounds
                    }
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
 * Tiến độ bảng đấu sang vòng tiếp theo bằng cách cập nhật các match placeholder.
 * Endpoint này nên được gọi sau khi tất cả các trận đấu của vòng hiện tại đã có kết quả.
 * @param {String} req.params.tournament_id
 */
// const advanceTournamentBracket = async (req, res) => {
//     const { tournament_id } = req.params;

//     try {
//         const tournament = await tournament_model.findOne({ id: tournament_id });
//         if (!tournament) {
//             return res.status(404).json({ message: 'Tournament not found.' });
//         }
        
//         if (tournament.format !== 'Loại trực tiếp' && tournament.format !== 'Loại lần 2') {
//             return res.status(400).json({ message: `Bracket advancement is not applicable for format: ${tournament.format}` });
//         }

//         // Tìm vòng đấu cao nhất đã hoàn thành
//         const completedMatches = await match_model.find({ tournament_ID: tournament_id, status: 'completed' })
//                                                    .sort({ round: -1 })
//                                                    .select('round')
//                                                    .lean();
//         const maxCompletedRoundNumber = completedMatches.length > 0 ? Math.max(...completedMatches.map(m => m.round)) : 0;
        
//         // Vòng hiện tại để tính người thắng là vòng cao nhất đã hoàn thành.
//         // Hoặc là vòng tiếp theo nếu đã có placeholder nhưng chưa hoàn thành.
//         let currentRoundForAdvancement = maxCompletedRoundNumber;
        
//         // Nếu vòng cao nhất (có thể có placeholder) chưa hoàn thành hết, thì đó là vòng chúng ta đang xử lý
//         const allMatches = await match_model.find({ tournament_ID: tournament_id }).sort({ round: 1 }).lean();
//         const highestRoundOverall = allMatches.length > 0 ? Math.max(...allMatches.map(m => m.round)) : 0;
        
//         // Nếu vòng cao nhất có match placeholder (players: []) và chưa hoàn thành hết,
//         // thì ta vẫn đang ở vòng đó và cần chờ completed.
//         // Hoặc nếu không có match nào hoàn thành, thì currentRoundForAdvancement vẫn là 0
//         if (highestRoundOverall > maxCompletedRoundNumber) {
//             // Có các match ở vòng cao hơn, nhưng chúng chưa hoàn thành.
//             // Điều này có nghĩa là chúng ta đang chờ kết quả của các match ở vòng này.
//             currentRoundForAdvancement = highestRoundOverall;
//         } else if (highestRoundOverall === maxCompletedRoundNumber && highestRoundOverall > 0) {
//             // Vòng cao nhất đã hoàn thành, có thể đã đến chung kết hoặc cần tiến lên vòng mới (đã là placeholder rồi)
//             // Kiểm tra xem có match placeholder ở vòng tiếp theo chưa.
//             const nextRoundPlaceholderCount = await match_model.countDocuments({
//                 tournament_ID: tournament_id,
//                 round: maxCompletedRoundNumber + 1,
//                 players: { $size: 0 }
//             });
//             if (nextRoundPlaceholderCount === 0) {
//                  // Đã là vòng cuối cùng của bracket và không có placeholder cho vòng tiếp theo
//                  // Cần xác định xem giải đấu đã thực sự kết thúc chưa.
//                  const lastMatch = allMatches.find(m => m.round === highestRoundOverall && m.bracket_type === 'grand_finals');
//                  if (lastMatch && lastMatch.status === 'completed') {
//                      return res.status(200).json({ message: 'Tournament already completed!' });
//                  }
//             } else {
//                 // Có placeholder cho vòng tiếp theo, vậy vòng hiện tại để cập nhật là vòng đó
//                 currentRoundForAdvancement = maxCompletedRoundNumber + 1;
//             }
//         }
        
//         if (currentRoundForAdvancement === 0) {
//             return res.status(400).json({ message: 'No matches to advance. Please create the bracket first.' });
//         }
        
//         // Lấy tất cả các match thuộc vòng đấu để xử lý winners/losers
//         const matchesInCurrentRound = await match_model.find({
//             tournament_ID: tournament_id,
//             round: currentRoundForAdvancement
//         }).lean();

//         if (matchesInCurrentRound.length === 0) {
//             return res.status(400).json({ message: `No matches found in round ${currentRoundForAdvancement}.` });
//         }
        
//         // Lấy các match ở vòng ngay trước đó (đã hoàn thành) để xác định người thắng.
//         const matchesInPreviousRoundCompleted = await match_model.find({
//             tournament_ID: tournament_id,
//             round: currentRoundForAdvancement - 1, // Vòng ngay trước
//             status: 'completed'
//         }).lean();

//         let winnersWB = []; 
//         let losersWB = [];  
//         let winnersLB = []; 
        
//         // Nếu đây là vòng 1, ta không cần người thắng từ vòng trước (đã tạo với người chơi thật rồi)
//         if (currentRoundForAdvancement > 1) { // Chỉ tính toán người thắng nếu không phải vòng 1
//             for (const match of matchesInPreviousRoundCompleted) {
//                 if (!match.players || match.players.length === 0 || match.status !== 'completed') {
//                     continue; // Bỏ qua match không có người chơi hoặc chưa hoàn thành
//                 }

//                 if (match.players.length === 1) { // BYE player hoặc auto advance
//                     const playerId = match.players[0];
//                     if (match.bracket_type === 'winners') {
//                         winnersWB.push(playerId);
//                     } else if (match.bracket_type === 'losers') {
//                         winnersLB.push(playerId);
//                     }
//                     continue;
//                 }
                
//                 if (match.players.length === 2) {
//                     const player1Result = match.results.find(r => r.player === match.players[0]);
//                     const player2Result = match.results.find(r => r.player === match.players[1]);

//                     if (!player1Result || !player2Result || typeof player1Result.score !== 'number' || typeof player2Result.score !== 'number') {
//                         // Lỗi dữ liệu, cần xử lý hoặc báo lỗi. Tuy nhiên, logic kiểm tra đã có.
//                         continue; 
//                     }
                    
//                     let winnerId = null;
//                     let loserId = null;

//                     if (player1Result.score > player2Result.score) {
//                         winnerId = player1Result.player;
//                         loserId = player2Result.player;
//                     } else if (player2Result.score > player1Result.score) {
//                         winnerId = player2Result.player;
//                         loserId = player1Result.player;
//                     } else {
//                         // Hòa, không tiến độ được
//                         return res.status(400).json({ message: `Match ${match.id} in round ${match.round} ended in a draw. Please resolve the draw before advancing.` });
//                     }

//                     if (match.bracket_type === 'winners') {
//                         winnersWB.push(winnerId);
//                         if (tournament.format === 'Loại lần 2') {
//                             losersWB.push(loserId); 
//                         }
//                     } else if (match.bracket_type === 'losers') {
//                         winnersLB.push(winnerId);
//                     }
//                 }
//             }
//         }
        
//         const updates = [];

//         // Lấy ngày diễn ra match ở vòng cao nhất để tính ngày cho vòng tiếp theo
//         const allMatchesOccurenceDates = allMatches.map(m => m.occurence_day);
//         const latestOverallMatchDate = allMatchesOccurenceDates.length > 0 ? new Date(Math.max(...allMatchesOccurenceDates)) : new Date();
//         const nextRoundDate = new Date(latestOverallMatchDate);
//         nextRoundDate.setDate(latestOverallMatchDate.getDate() + 7); // Giả định vòng tiếp theo sau 7 ngày

//         // 1. Cập nhật match placeholder trong nhánh thắng (Winners' Bracket)
//         // Tìm các match placeholder ở vòng hiện tại (currentRoundForAdvancement) của nhánh thắng
//         const nextWBMatchesToUpdate = matchesInCurrentRound.filter(m => m.bracket_type === 'winners' && m.players.length === 0);
        
//         if (tournament.format === 'Loại trực tiếp' || (tournament.format === 'Loại lần 2' && winnersWB.length > 0)) {
//             const shuffledWinnersWB = winnersWB.sort(() => 0.5 - Math.random());
            
//             for (let i = 0; i < shuffledWinnersWB.length; i += 2) {
//                 const player1 = shuffledWinnersWB[i];
//                 const player2 = shuffledWinnersWB[i + 1] || null;

//                 const playersForNextMatch = [player1];
//                 if (player2) playersForNextMatch.push(player2);

//                 if (nextWBMatchesToUpdate[Math.floor(i / 2)]) { // Cập nhật match placeholder đã tồn tại
//                     updates.push({
//                         updateOne: {
//                             filter: { id: nextWBMatchesToUpdate[Math.floor(i / 2)].id },
//                             update: { 
//                                 $set: { 
//                                     players: playersForNextMatch, 
//                                     status: 'pending', // Đặt lại pending cho match mới
//                                     results: playersForNextMatch.map(pid => ({ player: pid, score: 0 }))
//                                 }
//                             }
//                         }
//                     });
//                 }
//             }
//         }


//         // 2. Cập nhật match placeholder trong nhánh thua (Losers' Bracket)
//         if (tournament.format === 'Loại lần 2' && (losersWB.length > 0 || winnersLB.length > 0)) {
//             const allLBPlayers = [...losersWB, ...winnersLB].sort(() => 0.5 - Math.random()); 

//             const nextLBMatchesToUpdate = matchesInCurrentRound.filter(m => m.bracket_type === 'losers' && m.players.length === 0);

//             for (let i = 0; i < allLBPlayers.length; i += 2) {
//                 const player1 = allLBPlayers[i];
//                 const player2 = allLBPlayers[i + 1] || null;

//                 const playersForNextMatch = [player1];
//                 if (player2) playersForNextMatch.push(player2);

//                 if (nextLBMatchesToUpdate[Math.floor(i / 2)]) { // Cập nhật match placeholder đã tồn tại
//                     updates.push({
//                         updateOne: {
//                             filter: { id: nextLBMatchesToUpdate[Math.floor(i / 2)].id },
//                             update: { 
//                                 $set: { 
//                                     players: playersForNextMatch, 
//                                     status: 'pending',
//                                     results: playersForNextMatch.map(pid => ({ player: pid, score: 0 }))
//                                 }
//                             }
//                         }
//                     });
//                 }
//             }
//         }

//         // 3. Cập nhật match Grand Finals (nếu là Loại lần 2 và đã có người thắng WB/LB cuối cùng)
//         if (tournament.format === 'Loại lần 2' && winnersWB.length === 1 && winnersLB.length === 1) {
//             const wbWinner = winnersWB[0];
//             const lbWinner = winnersLB[0];

//             // Tìm match Grand Finals placeholder (ở vòng cao nhất hoặc vòng tiếp theo)
//             const grandFinalsMatchToUpdate = matchesInCurrentRound.find(m => m.bracket_type === 'grand_finals' && m.players.length === 0);

//             if (grandFinalsMatchToUpdate) {
//                 updates.push({
//                     updateOne: {
//                         filter: { id: grandFinalsMatchToUpdate.id },
//                         update: {
//                             $set: {
//                                 players: [wbWinner, lbWinner],
//                                 status: 'pending', 
//                                 results: [{ player: wbWinner, score: 0 }, { player: lbWinner, score: 0 }]
//                             }
//                         }
//                     }
//                 });
//             } else {
//                 console.warn("[WARNING] Grand Finals placeholder match not found for update. Cannot set players.");
//             }
//         }
        
//         if (updates.length === 0) {
//             return res.status(200).json({ message: 'No new matches updated for the next round. Tournament might be completed or awaiting more results.' });
//         }

//         await match_model.bulkWrite(updates);

//         console.log(`[BRACKET ADVANCED] Updated ${updates.length} matches for Tournament ${tournament_id}`);
//         res.status(201).json({
//             message: `Bracket advanced to next round. Matches updated.`,
//             updatedCount: updates.length
//         });

//     } catch (error) {
//         console.error('[ERROR][advanceTournamentBracket]: ', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

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

        // Tìm vòng đấu cao nhất hiện có (bao gồm cả các match chưa hoàn thành)
        const highestOverallRoundMatch = await match_model.findOne({ tournament_ID: tournament_id })
                                                .sort({ round: -1 })
                                                .select('round')
                                                .lean();
        const currentRound = highestOverallRoundMatch ? highestOverallRoundMatch.round : 0;
        
        if (currentRound === 0) {
            return res.status(400).json({ message: 'No matches found. Please create the first round first.' });
        }

        // Lấy tất cả các trận đấu của vòng hiện tại (vòng cao nhất đang có)
        const matchesInCurrentRound = await match_model.find({
            tournament_ID: tournament_id,
            round: currentRound
        }).lean();

        if (matchesInCurrentRound.length === 0) {
            return res.status(400).json({ message: `No matches found in round ${currentRound}.` });
        }

        // Kiểm tra xem tất cả các trận đấu trong vòng hiện tại đã hoàn thành chưa
        const allMatchesCompleted = matchesInCurrentRound.every(match => match.status === 'completed');
        if (!allMatchesCompleted) {
            return res.status(400).json({ message: `Not all matches in round ${currentRound} are completed. Cannot advance bracket.` });
        }

        // Xác định người thắng và người thua cho vòng này
        const winnersWB = []; // Winners' Bracket winners
        const losersWB = [];  // Winners' Bracket losers (who drop to LB)
        const winnersLB = []; // Losers' Bracket winners

        for (const match of matchesInCurrentRound) {
            if (match.players.length === 1) { // Player had a BYE or walked over (single player match)
                if (match.bracket_type === 'winners') {
                    winnersWB.push(match.players[0]);
                } else if (match.bracket_type === 'losers') {
                    winnersLB.push(match.players[0]);
                }
                continue;
            }

            if (match.players.length !== 2) {
                return res.status(400).json({ message: `Unsupported player count (${match.players.length}) for winner determination in match ${match.id}.` });
            }

            const player1Result = match.results.find(r => r.player === match.players[0]);
            const player2Result = match.results.find(r => r.player === match.players[1]);

            if (!player1Result || !player2Result || typeof player1Result.score !== 'number' || typeof player2Result.score !== 'number') {
                return res.status(400).json({ message: `Match ${match.id} has incomplete or invalid scores.` });
            }
            
            let winnerId, loserId;
            if (player1Result.score > player2Result.score) {
                winnerId = player1Result.player;
                loserId = player2Result.player;
            } else if (player2Result.score > player1Result.score) {
                winnerId = player2Result.player;
                loserId = player1Result.player;
            } else {
                return res.status(400).json({ message: `Match ${match.id} ended in a draw. Please resolve the draw before advancing.` });
            }

            if (match.bracket_type === 'winners') {
                winnersWB.push(winnerId);
                // Người thua từ nhánh thắng rơi xuống nhánh thua
                losersWB.push(loserId); 
            } else if (match.bracket_type === 'losers') {
                winnersLB.push(winnerId);
                // Người thua từ nhánh thua bị loại
            } else if (match.bracket_type === 'grand_finals') {
                // Trong trận chung kết, người thua sẽ là Á quân
                return res.status(200).json({ 
                    message: 'Tournament completed!', 
                    winner: winnerId, 
                    runnerUp: loserId 
                });
            }
        }

        // Nếu chỉ còn 1 người thắng trong Winners' Bracket và giải đấu là Loại trực tiếp (Single Elimination)
        if (winnersWB.length === 1 && tournament.format === 'Loại trực tiếp') {
            return res.status(200).json({ message: 'Tournament completed!', winner: winnersWB[0] });
        }


        // Logic tạo các match cho vòng tiếp theo (currentRound + 1)
        const nextRound = currentRound + 1;
        const nextRoundMatchesToInsert = [];
        
        // Ước tính ngày diễn ra vòng tiếp theo
        const currentRoundOccurenceDates = matchesInCurrentRound.map(m => m.occurence_day);
        const latestMatchDate = new Date(Math.max(...currentRoundOccurenceDates));
        const nextRoundDate = new Date(latestMatchDate);
        nextRoundDate.setDate(latestMatchDate.getDate() + 7); // Ví dụ: 1 tuần sau vòng trước

        // --- Logic Ghép Cặp cho Nhánh Thắng (Winners' Bracket) ---
        // Nếu còn hơn 1 người trong Winners' Bracket, tạo trận mới cho nhánh thắng
        if (winnersWB.length > 1) {
            const shuffledWinnersWB = winnersWB.sort(() => 0.5 - Math.random());
            for (let i = 0; i < shuffledWinnersWB.length; i += 2) {
                const player1 = shuffledWinnersWB[i];
                const player2 = shuffledWinnersWB[i + 1] || null;

                const playersInNewMatch = [player1];
                if (player2) playersInNewMatch.push(player2);
                else { // Nếu số người chơi lẻ, người chơi cuối cùng được BYE
                    // Trong trường hợp này, match chỉ có 1 người, và họ sẽ tự động thắng
                    // Điều này đã được xử lý bởi `match.players.length === 1` ở trên
                }

                nextRoundMatchesToInsert.push({
                    id: uuidv4(),
                    tournament_ID: tournament_id,
                    format: tournament.format,
                    players: playersInNewMatch,
                    results: playersInNewMatch.map(pid => ({ player: pid, score: 0 })),
                    occurence_day: nextRoundDate,
                    round: nextRound,
                    status: 'pending',
                    bracket_type: 'winners' 
                });
            }
        }
        
        // --- Logic Ghép Cặp cho Nhánh Thua (Losers' Bracket) ---
        // Chỉ xử lý nhánh thua nếu là loại lần 2
        if (tournament.format === 'Loại lần 2') {
            const allLosersBracketPlayers = [...losersWB, ...winnersLB]; 
            
            // Nếu có số lượng người chơi lẻ trong nhánh thua, sẽ có một BYE
            let lbPlayersToPair = [...allLosersBracketPlayers];
            if (lbPlayersToPair.length % 2 !== 0 && lbPlayersToPair.length > 0) {
                console.warn("[WARNING] Odd number of players for Losers' Bracket. One player will get a BYE.");
                // Người chơi cuối cùng sẽ tự động tiến vào vòng tiếp theo mà không đấu
                // Chúng ta không tạo match cho họ ở đây.
            }

            if (lbPlayersToPair.length > 1) { // Chỉ tạo match nếu có ít nhất 2 người
                const shuffledLBPlayers = lbPlayersToPair.sort(() => 0.5 - Math.random());
                for (let i = 0; i < shuffledLBPlayers.length; i += 2) {
                    const player1 = shuffledLBPlayers[i];
                    const player2 = shuffledLBPlayers[i + 1] || null;

                    if (!player1 || !player2) { 
                        // Trường hợp BYE hoặc người chơi lẻ không có đối thủ
                        // Người chơi này sẽ tự động tiến lên vòng sau, không cần tạo match vật lý.
                        continue; 
                    }

                    const playersInNewMatch = [player1, player2];
                    
                    nextRoundMatchesToInsert.push({
                        id: uuidv4(),
                        tournament_ID: tournament_id,
                        format: tournament.format,
                        players: playersInNewMatch,
                        results: playersInNewMatch.map(pid => ({ player: pid, score: 0 })),
                        occurence_day: nextRoundDate,
                        round: nextRound, 
                        status: 'pending',
                        bracket_type: 'losers' 
                    });
                }
            }
        }
        
        // --- Logic Tạo Grand Finals (Chung kết tổng) ---
        // Chỉ tạo Grand Finals khi chỉ còn 1 người thắng từ nhánh thắng (winnersWB) 
        // và 1 người thắng từ nhánh thua (winnersLB)
        if (tournament.format === 'Loại lần 2' && winnersWB.length === 1 && winnersLB.length === 1) {
            const wbWinner = winnersWB[0];
            const lbWinner = winnersLB[0];
            
            // Kiểm tra xem Grand Finals đã được tạo chưa
            const existingGrandFinals = await match_model.findOne({
                tournament_ID: tournament_id,
                bracket_type: 'grand_finals'
            });

            if (!existingGrandFinals) {
                const grandFinalsMatch = {
                    id: uuidv4(),
                    tournament_ID: tournament_id,
                    format: tournament.format,
                    players: [wbWinner, lbWinner],
                    results: [{ player: wbWinner, score: 0 }, { player: lbWinner, score: 0 }],
                    occurence_day: nextRoundDate, 
                    round: nextRound, 
                    status: 'pending',
                    bracket_type: 'grand_finals' 
                };
                await match_model.insertMany([grandFinalsMatch]);

                return res.status(201).json({
                    message: 'Grand Finals match created!',
                    data: [grandFinalsMatch]
                });
            } else {
                return res.status(200).json({ message: 'Grand Finals already created.' });
            }
        }
        
        if (nextRoundMatchesToInsert.length === 0) {
            // Nếu không có match nào được tạo, có thể giải đấu đã hoàn thành hoặc đang chờ thêm kết quả
            return res.status(200).json({ message: 'No new matches generated for the next round. Tournament might be completed or awaiting more results.' });
        }

        // Lưu các trận đấu vòng tiếp theo vào database
        await match_model.insertMany(nextRoundMatchesToInsert);

        console.log(`[BRACKET ADVANCED] Generated ${nextRoundMatchesToInsert.length} matches for Round ${nextRound} in tournament ${tournament_id}`);
        res.status(201).json({
            message: `Bracket advanced to Round ${nextRound}. Matches created.`,
            data: nextRoundMatchesToInsert.map(match => ({
                id: match.id,
                tournament_ID: match.tournament_ID,
                players: match.players,
                occurence_day: match.occurence_day,
                round: match.round,
                bracket_type: match.bracket_type
            }))
        });

    } catch (error) {
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
