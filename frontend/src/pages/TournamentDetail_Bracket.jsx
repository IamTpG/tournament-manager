import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css'; // Cho các style tổng thể trang
import './Bracket.css'; // Cho các style của bracket và ranking table

function TournamentDetailBracket() {
    const { tournament_id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]); // Lưu trữ danh sách các match từ backend
    const [players, setPlayers] = useState([]); // Lưu trữ danh sách người chơi để mapping ID ra tên
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isLoggedIn = !!localStorage.getItem("jwtToken");
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("jwtToken");
        const isLoggedIn = !!token;
        const config = {
            headers: isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {}
        };
    
        try {
            setLoading(true);
            setError(null);
    
            // 1. LẤY THÔNG TIN GIẢI ĐẤU (LUÔN CẦN)
            const tournamentUrl = isLoggedIn
                ? `http://localhost:5000/api/admin/tournament/${tournament_id}`
                : `http://localhost:5000/api/tournament/${tournament_id}`;
            
            const tournamentRes = await axios.get(tournamentUrl, config);
            setTournament(tournamentRes.data);
    
            // 2. LẤY DANH SÁCH NGƯỜI CHƠI (CẢ ADMIN & USER)
            const playersUrl = isLoggedIn
                ? `http://localhost:5000/api/admin/members/tournament/${tournament_id}`
                : `http://localhost:5000/api/admin/members/tournament/${tournament_id}/public`;
            
            const playersRes = await axios.get(playersUrl, config);
            setPlayers(playersRes.data);
    
            // 3. LẤY DANH SÁCH TRẬN ĐẤU (CẢ ADMIN & USER)
            try {
                const matchesUrl = isLoggedIn
                    ? `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`
                    : `http://localhost:5000/api/tournament/${tournament_id}/matches`;
                
                const matchesRes = await axios.get(matchesUrl, config);
                setMatches(matchesRes.data);
            } catch (matchesErr) {
                if (matchesErr.response?.status === 404) {
                    setMatches([]);
                } else {
                    console.error("Failed to fetch matches:", matchesErr);
                    setMatches([]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
            if (err.response?.status === 404) {
                setError("Không tìm thấy giải đấu.");
            } else if (err.response?.status === 401) {
                setError("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
            } else {
                setError("Không thể tải thông tin giải đấu. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }, [tournament_id]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hàm xử lý việc tạo bảng đấu (chỉ dành cho admin)
    const handleGenerateBracket = async () => {
        const confirmGenerate = window.confirm("Bạn có chắc chắn muốn tạo bảng đấu cho giải này không? Thao tác này sẽ tạo toàn bộ cấu trúc bracket và không thể hoàn tác nếu đã có match!");
        if (!confirmGenerate) {
            return;
        }

        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        try {
            await axios.post(
                `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`, // Endpoint POST tạo match
                {}, // Body rỗng
                config
            );
            window.alert('Cấu trúc bảng đấu đã được tạo và lưu thành công!');
            fetchData(); // Tải lại dữ liệu để hiển thị các match mới
        } catch (err) {
            console.error("Failed to generate bracket:", err);
            if (err.response && err.response.status === 409) {
                window.alert(err.response.data.message || "Bảng đấu đã tồn tại cho giải đấu này. Vui lòng xóa để tạo lại.");
            } else if (err.response && err.response.status === 400) {
                 window.alert(err.response.data.message || "Không đủ người chơi hoặc không hỗ trợ loại hình/game này để tạo match.");
            }
            else {
                window.alert('Có lỗi xảy ra khi tạo bảng đấu. Vui lòng thử lại.');
            }
        }
    };

    // Hàm xử lý việc tiến độ bảng đấu (cập nhật vòng tiếp theo)
    const handleAdvanceBracket = async () => {
        const confirmAdvance = window.confirm("Bạn có chắc chắn muốn tiến độ bảng đấu sang vòng tiếp theo không? Đảm bảo tất cả các trận đấu ở vòng hiện tại đã hoàn thành!");
        if (!confirmAdvance) {
            return;
        }

        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        try {
            await axios.post(
                `http://localhost:5000/api/admin/tournament/${tournament_id}/advance-bracket`, // Endpoint POST mới
                {}, // Body rỗng
                config
            );
            window.alert('Bảng đấu đã được tiến độ thành công!');
            fetchData(); // Tải lại dữ liệu để hiển thị vòng mới
        } catch (err) {
            console.error("Failed to advance bracket:", err);
            window.alert(err.response?.data?.message || 'Có lỗi xảy ra khi tiến độ bảng đấu. Vui lòng kiểm tra lại các trận đấu đã hoàn thành.');
        }
    };

    // Hàm để tìm tên người chơi từ ID
    const getPlayerName = useCallback((playerId) => {
        const player = players.find(p => p.id === playerId);
        // Trả về tên hoặc "BYE" nếu đó là BYE_PLAYER, hoặc ID nếu không tìm thấy
        if (playerId && playerId.startsWith('BYE_PLAYER_')) {
            return 'BYE';
        }
        return player ? player.name_in_tournament : playerId; 
    }, [players]);

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

    // Hàm chuyển đổi chuỗi "DD/MM/YYYY" thành đối tượng Date hợp lệ
    const convertToValidDateObject = (dateString) => {
        // Nếu chuỗi rỗng, trả về null
        if (!dateString) return null;
        
        const parts = dateString.split('/');
        // Lấy ngày, tháng, năm từ chuỗi
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
        const year = parseInt(parts[2], 10);
        
        return new Date(year, month, day);
    };

    // Cập nhật lại logic kiểm tra ngày bắt đầu
    const tournamentStartDate = convertToValidDateObject(tournament.start_date);
    const hasTournamentStarted = tournamentStartDate && new Date() >= tournamentStartDate;

    // Hằng số cho chiều cao match
    const MATCH_HEIGHT = 70; 

    // Hàm tính toán khoảng trống cần thiết giữa các match để nối bracket (theo code cũ của bạn)
    const getGapHeight = (roundIndex) => {
        return Math.pow(2, roundIndex) * (MATCH_HEIGHT + 10) - MATCH_HEIGHT;
    };
    
    // Dựng lại logic hiển thị bracket từ `matches` đã fetch
    const renderBracketData = (fetchedMatches) => {
        if (!fetchedMatches || fetchedMatches.length === 0 ) {
            return (
                <div className="no-schedule-message">
                    <h2>Chưa có bảng đấu</h2>
                    <p>Bảng đấu sẽ được tạo và công bố sau khi giải đấu bắt đầu.</p>
                    {hasTournamentStarted && isLoggedIn && (
                        <button onClick={handleGenerateBracket} className="generate-bracket-btn">
                            Tạo Bảng Đấu
                        </button>
                    )}
                </div>
            );
        }

        // Nhóm các match theo vòng đấu và nhánh đấu
        const roundsMap = new Map();
        fetchedMatches.forEach(match => {
            const roundKey = match.round;
            const bracketType = match.bracket_type || 'winners'; 
            
            const validBracketTypes = ['winners', 'losers', 'grand_finals'];
            const finalBracketType = validBracketTypes.includes(bracketType) ? bracketType : 'winners';


            if (!roundsMap.has(roundKey)) {
                roundsMap.set(roundKey, { winners: [], losers: [], grand_finals: [] });
            }
            roundsMap.get(roundKey)[finalBracketType].push(match);
        });

        // Sắp xếp các vòng đấu theo số thứ tự vòng
        const sortedRoundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);
        const bracket = sortedRoundNumbers.map(roundNum => {
            const roundData = roundsMap.get(roundNum);
            // Sắp xếp các match trong cùng một nhánh để hiển thị ổn định
            const sortedWinnersMatches = roundData.winners.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
            const sortedLosersMatches = roundData.losers.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
            const sortedGrandFinalsMatches = roundData.grand_finals.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
            return {
                roundNumber: roundNum,
                winners: sortedWinnersMatches,
                losers: sortedLosersMatches,
                grand_finals: sortedGrandFinalsMatches
            };
        });

        // Hàm đặt tên vòng đấu
        const getRoundName = (currentRoundNumber, bracketData) => {
            const numMatchesInWinners = bracketData.winners.length;
            // const numMatchesInLosers = bracketData.losers.length; // Not used for naming currently

            if (bracketData.grand_finals.length > 0) {
                return "Chung kết tổng";
            }
            if (tournament.format === 'Loại trực tiếp') {
                if (numMatchesInWinners === 1) return "Chung kết";
                if (numMatchesInWinners === 2) return "Bán kết";
                if (numMatchesInWinners === 4) return "Tứ kết";
                return `Vòng ${currentRoundNumber}`; 
            } else if (tournament.format === 'Loại lần 2') {
                // Logic naming cho DE có thể phức tạp hơn, tùy thuộc vào số vòng của nhánh thắng/thua
                // Nếu bạn có yêu cầu cụ thể hơn cho tên vòng DE, vui lòng cung cấp thêm.
            }
            
            return `Vòng ${currentRoundNumber}`;
        };

        // Vòng cao nhất tổng thể trong bracket (kể cả placeholder) - dùng cho việc
        // xác định trận đấu cuối cùng khi kiểm tra giải đấu đã kết thúc chưa (bên dưới).
        const highestRoundOverall = sortedRoundNumbers.length > 0 ? sortedRoundNumbers[sortedRoundNumbers.length - 1] : 0;

        // Vòng đấu cao nhất ĐÃ CÓ NGƯỜI CHƠI THẬT (bỏ qua các placeholder rỗng của
        // các vòng sau, cùng cách xử lý với advanceTournamentBracket ở backend).
        const highestPopulatedRoundNumber = fetchedMatches.reduce((max, match) =>
            match.players.length > 0 ? Math.max(max, match.round) : max, 0
        );

        // Có thể tiến độ nếu vòng hiện tại (có người chơi thật) đã hoàn thành VÀ không phải là vòng cuối cùng của bracket
        let canAdvance = false;
        if (highestPopulatedRoundNumber > 0) {
             const matchesInHighestPopulatedRound = bracket.find(r => r.roundNumber === highestPopulatedRoundNumber);
             const allMatchesInHighestPopulatedRoundAreCompleted = matchesInHighestPopulatedRound &&
                                                                 [...matchesInHighestPopulatedRound.winners,
                                                                  ...matchesInHighestPopulatedRound.losers,
                                                                  ...matchesInHighestPopulatedRound.grand_finals]
                                                                  .filter(m => m.players.length > 0) // Chỉ xét match có người chơi
                                                                  .every(m => m.status === 'completed');

            // Kiểm tra xem đã đến trận chung kết tổng chưa (nếu là Loại lần 2)
            const isGrandFinalsRound = matchesInHighestPopulatedRound && matchesInHighestPopulatedRound.grand_finals.length > 0;
            const isSingleEliminationFinal = tournament.format === 'Loại trực tiếp' &&
                                             matchesInHighestPopulatedRound &&
                                             matchesInHighestPopulatedRound.winners.length === 1 &&
                                             matchesInHighestPopulatedRound.winners[0].players.length > 0;

            if (allMatchesInHighestPopulatedRoundAreCompleted && !isGrandFinalsRound && !isSingleEliminationFinal) {
                // Nếu vòng hiện tại đã hoàn thành và chưa phải chung kết, thì có thể advance
                canAdvance = true;
            } else if (tournament.format === 'Loại lần 2' && isGrandFinalsRound && matchesInHighestPopulatedRound.grand_finals.every(m => m.status === 'completed')) {
                // Grand Finals đã hoàn thành, giải đấu kết thúc.
                canAdvance = false;
            }
        }


        // Kiểm tra nếu giải đấu đã kết thúc
        let isTournamentCompleted = false;
        let winnerOfTournament = null;

        // Tìm match chung kết tổng hoặc chung kết nhánh thắng cuối cùng
        const finalMatches = fetchedMatches.filter(m => 
            m.bracket_type === 'grand_finals' || 
            (tournament.format === 'Loại trực tiếp' && m.round === highestRoundOverall && m.bracket_type === 'winners' && m.players.length === 2)
        ).sort((a,b) => b.round - a.round); // Lấy match có round cao nhất

        if (finalMatches.length > 0) {
            const finalMatch = finalMatches[0];
            if (finalMatch.status === 'completed' && finalMatch.players.length === 2 && finalMatch.results.length === 2) {
                isTournamentCompleted = true;
                winnerOfTournament = finalMatch.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player;
            }
        }


        return (
            <div className="bracket-page"> {/* Wrapper chính cho bracket */}
                <div className="bracket-controls">
                    {/* Nút tiến độ vòng tiếp theo */}
                    {!isTournamentCompleted && hasTournamentStarted  && canAdvance && isLoggedIn && 
                        (tournament.format === 'Loại trực tiếp' || tournament.format === 'Loại lần 2') && (
                        <button onClick={handleAdvanceBracket} className="advance-bracket-btn">
                            Cập nhật vòng Tiếp Theo
                        </button>
                    )}
                    {isTournamentCompleted && (
                         <div className="tournament-complete-message">
                            Giải đấu đã kết thúc! Nhà vô địch: **{getPlayerName(winnerOfTournament)}**
                        </div>
                    )}
                </div>

                <div className="bracket-container">
                    {bracket.map((roundData, roundIndex) => (
                        <div className="round" key={roundIndex}>
                            <div className="round-title">
                                {getRoundName(roundData.roundNumber, roundData)} {/* Sử dụng hàm getRoundName */}
                            </div>
                            
                            {/* Hiển thị Nhánh Thắng (Winners' Bracket) */}
                            {roundData.winners.length > 0 && (
                                <div className="bracket-segment winners-bracket">
                                    {tournament.format === 'Loại lần 2' && <h4 className="bracket-segment-title">Nhánh thắng</h4>}
                                    {roundData.winners.map((match, matchIndex) => {
                                        // Kiểm tra xem có cần đường nối hay không (match cuối của cặp và không phải vòng cuối)
                                        const isFirstMatchInPair = matchIndex % 2 === 0;
                                        const hasNextMatchInPair = matchIndex + 1 < roundData.winners.length;
                                        const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

                                        // Xác định người thắng để in đậm
                                        let winnerId = null;
                                        if (match.status === 'completed' && match.players.length > 0 && match.results && match.results.length > 0) {
                                            // Lấy người có điểm cao nhất
                                            const highestScoreResult = match.results.reduce((prev, current) => (prev.score > current.score ? prev : current));
                                            winnerId = highestScoreResult.player;
                                        }

                                        return (
                                            <div
                                                className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
                                                key={match.id}
                                                style={{
                                                    marginBottom: matchIndex !== roundData.winners.length - 1 ? `${getGapHeight(roundIndex)}px` : 0,
                                                }}
                                            >
                                                <div className="player-pair">
                                                    {match.players.length > 0 ? ( // Chỉ render player nếu có player
                                                        match.players.map((playerID, pIdx) => (
                                                            <div 
                                                                key={pIdx} 
                                                                className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
                                                            >
                                                                {getPlayerName(playerID)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Render 2 div trống nếu không có player (cho match placeholder)
                                                        <>
                                                            <div className="player empty-player"></div>
                                                            <div className="player empty-player"></div>
                                                        </>
                                                    )}
                                                </div>
                                                {match.status === 'completed' && match.players.length > 0 && match.results.length > 0 && (
                                                    <div className="match-scores">
                                                        {match.results.map((res, resIdx) => {
                                                            const isWinner = winnerId === res.player;
                                                            return (
                                                                <span key={resIdx}>
                                                                    {getPlayerName(res.player)}: {res.score}
                                                                    {isWinner && " (W)"}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {/* Logic vẽ đường nối */}
                                                {roundIndex < bracket.length - 1 && (
                                                    <>
                                                        <div className="horizontal-line"></div> 
                                                        {showConnectors && (
                                                            <>
                                                                <div 
                                                                    className="vertical-line"
                                                                    style={{ 
                                                                        height: `${MATCH_HEIGHT + getGapHeight(roundIndex)}px`,
                                                                        top: `${MATCH_HEIGHT / 2}px` 
                                                                    }}
                                                                ></div>
                                                                <div 
                                                                    className="horizontal-line-next"
                                                                    style={{ 
                                                                        top: `${getGapHeight(roundIndex) / 2 + MATCH_HEIGHT}px`
                                                                    }}
                                                                ></div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Hiển thị Nhánh Thua (Losers' Bracket) - chỉ cho Loại lần 2 */}
                            {tournament.format === 'Loại lần 2' && roundData.losers.length > 0 && (
                                <div className="bracket-segment losers-bracket">
                                    <h4 className="bracket-segment-title">Nhánh thua</h4>
                                    {roundData.losers.map((match, matchIndex) => {
                                        const isFirstMatchInPair = matchIndex % 2 === 0;
                                        const hasNextMatchInPair = matchIndex + 1 < roundData.losers.length;
                                        const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

                                        // Xác định người thắng để in đậm
                                        let winnerId = null;
                                        if (match.status === 'completed' && match.players.length > 0 && match.results && match.results.length > 0) {
                                            const highestScoreResult = match.results.reduce((prev, current) => (prev.score > current.score ? prev : current));
                                            winnerId = highestScoreResult.player;
                                        }

                                        return (
                                            <div
                                                className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
                                                key={match.id}
                                                style={{
                                                    marginBottom: matchIndex !== roundData.losers.length - 1 ? `${getGapHeight(roundIndex)}px` : 0,
                                                }}
                                            >
                                                <div className="player-pair">
                                                    {match.players.length > 0 ? ( // Chỉ render player nếu có player
                                                        match.players.map((playerID, pIdx) => (
                                                            <div 
                                                                key={pIdx} 
                                                                className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
                                                            >
                                                                {getPlayerName(playerID)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Render 2 div trống nếu không có player (cho match placeholder)
                                                        <>
                                                            <div className="player empty-player"></div>
                                                            <div className="player empty-player"></div>
                                                        </>
                                                    )}
                                                </div>
                                                {match.status === 'completed' && match.players.length > 0 && match.results.length > 0 && (
                                                    <div className="match-scores">
                                                        {match.results.map((res, resIdx) => {
                                                            const isWinner = winnerId === res.player;
                                                            return (
                                                                <span key={resIdx}>
                                                                    {getPlayerName(res.player)}: {res.score}
                                                                    {isWinner && " (W)"}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {/* Logic vẽ đường nối cho nhánh thua (tương tự nhánh thắng) */}
                                                {roundIndex < bracket.length - 1 && (
                                                    <>
                                                        <div className="horizontal-line"></div>
                                                        {showConnectors && (
                                                            <>
                                                                <div 
                                                                    className="vertical-line"
                                                                    style={{ 
                                                                        height: `${MATCH_HEIGHT + getGapHeight(roundIndex)}px`,
                                                                        top: `${MATCH_HEIGHT / 2}px`
                                                                    }}
                                                                ></div>
                                                                <div 
                                                                    className="horizontal-line-next"
                                                                    style={{ 
                                                                        top: `${getGapHeight(roundIndex) / 2 + MATCH_HEIGHT}px`
                                                                    }}
                                                                ></div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Hiển thị Chung kết tổng (Grand Finals) */}
                            {roundData.grand_finals.length > 0 && (
                                <div className="bracket-segment grand-finals-bracket">
                                    <h4 className="bracket-segment-title">Chung kết tổng</h4>
                                    {roundData.grand_finals.map((match) => {
                                        let winnerId = null;
                                        if (match.status === 'completed' && match.players.length > 0 && match.results.length > 0) {
                                            const highestScoreResult = match.results.reduce((prev, current) => (prev.score > current.score ? prev : current));
                                            winnerId = highestScoreResult.player;
                                        }

                                        return (
                                            <div
                                                className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
                                                key={match.id}
                                            >
                                                <div className="player-pair">
                                                    {match.players.length > 0 ? ( // Chỉ render player nếu có player
                                                        match.players.map((playerID, pIdx) => (
                                                            <div 
                                                                key={pIdx} 
                                                                className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
                                                            >
                                                                {getPlayerName(playerID)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <div className="player empty-player"></div>
                                                            <div className="player empty-player"></div>
                                                        </>
                                                    )}
                                                </div>
                                                {match.status === 'completed' && match.players.length > 0 && match.results.length > 0 && (
                                                    <div className="match-scores">
                                                        {match.results.map((res, resIdx) => {
                                                            const isWinner = winnerId === res.player;
                                                            return (
                                                                <span key={resIdx}>
                                                                    {getPlayerName(res.player)}: {res.score}
                                                                    {isWinner && " (W)"}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderRankingContent = () => {
        const playerScoresMap = new Map();
        // Giả sử logic lấy điểm cho ranking từ matches đã có
        const rankingMatch = matches.find(m => m.format === 'Xếp hạng');
        if (rankingMatch && rankingMatch.results) {
            rankingMatch.results.forEach(res => {
                playerScoresMap.set(res.player, res.score);
            });
        }

        const playerNamesWithScores = players.map(p => ({
            id: p.id,
            playerName: p.name_in_tournament,
            score: playerScoresMap.get(p.id) || 0, // Lấy điểm thực tế hoặc 0
        })).sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

        return (
            <div className="ranking-container">
                <h2>Bảng Xếp Hạng</h2>
                <table className="ranking-table">
                    <thead>
                        <tr className="table-header">
                            <th className="table-cell">Hạng</th>
                            <th className="table-cell">Kỳ Thủ</th>
                            <th className="table-cell">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerNamesWithScores.map((player) => (
                            <tr key={player.id} className="table-row">
                                <td className="table-cell">{player.rank}</td>
                                <td className="table-cell">{player.playerName}</td>
                                <td className="table-cell">{player.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContentBasedOnFormat = () => {
        if (!hasTournamentStarted) {
            return (
                <div className="no-schedule-message">
                    <h2>Giải đấu chưa bắt đầu</h2>
                    <p>Bảng đấu/xếp hạng sẽ được công bố sau khi giải đấu bắt đầu.</p>
                </div>
            );
        }

        switch (tournament.format) {
            case "Loại trực tiếp":
            case "Loại lần 2":
                return renderBracketData(matches); 
            case "Xếp hạng":
                return renderRankingContent(); 
            case "TFT": 
                return renderBracketData(matches);
            default:
                return (
                    <div className="no-schedule-message">
                        <h2>Loại hình giải đấu không xác định hoặc chưa có bảng đấu/xếp hạng.</h2>
                        <p>Vui lòng kiểm tra lại loại hình giải đấu hoặc chờ cập nhật.</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles["banner"]}>
                <img
                    src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
                    alt={tournament.title}
                />
            </div>

            <div className={styles["info-section"]}>
                <h1>{tournament.title}</h1>
                <p>
                    {tournament.start_date}  -  {tournament.end_date}
                </p>
                <p>{tournament.participants || 0} Participants</p>
            </div>

            <div className={styles["tabs"]}>
                <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
                <button onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>🎮 Các trận đấu</button>
            </div>
            {renderContentBasedOnFormat()}
        </div>
    );
}

export default TournamentDetailBracket;
