
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css'; // Đảm bảo các style là chính xác



function TournamentDetailsMatch() {
    const { tournament_id } = useParams();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]); // State để lưu danh sách người chơi để mapping ID ra tên
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Hàm để tìm tên người chơi từ ID
    const getPlayerName = useCallback((playerId) => {
        const player = players.find(p => p.id === playerId);
        // Trả về tên hoặc "BYE" nếu đó là BYE_PLAYER, hoặc ID nếu không tìm thấy
        if (playerId && playerId.startsWith('BYE_PLAYER_')) {
            return 'BYE'; // Hiện thị "BYE" rõ ràng cho các trường hợp BYE
        }
        return player ? player.name_in_tournament : playerId; 
    }, [players]);

    // Hàm để kiểm tra trạng thái đăng nhập và cập nhật state
    const checkLoginStatus = useCallback(() => {
        const token = localStorage.getItem("jwtToken");
        setIsLoggedIn(!!token);
    }, []);

    
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {}
        };

        try {
            setLoading(true);
            setError(null);

            // 1. Lấy thông tin giải đấu
            const tournamentUrl = isLoggedIn
                ? `http://localhost:5000/api/admin/tournament/${tournament_id}`
                : `http://localhost:5000/api/tournament/${tournament_id}`;
            
            const tournamentRes = await axios.get(tournamentUrl, config);
            setTournament(tournamentRes.data);

            // 2. Lấy danh sách người chơi
            const playersUrl = isLoggedIn
                ? `http://localhost:5000/api/admin/members/tournament/${tournament_id}`
                : `http://localhost:5000/api/tournament/${tournament_id}/players_approved`; // Sử dụng endpoint public đã thống nhất
            
            const playersRes = await axios.get(playersUrl, config);
            setPlayers(playersRes.data);

            // 3. Lấy danh sách trận đấu
            try {
                const matchesUrl = isLoggedIn
                    ? `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`
                    : `http://localhost:5000/api/tournament/${tournament_id}/matches`;
                
                const matchesRes = await axios.get(matchesUrl, config);
                // Sắp xếp các trận đấu theo ngày và round
                const sortedMatches = matchesRes.data.sort((a, b) => {
                    const dateA = new Date(a.occurence_day);
                    const dateB = new Date(b.occurence_day);
                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateA.getTime() - dateB.getTime();
                    }
                    return a.round - b.round;
                });
                setMatches(sortedMatches);
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
    }, [tournament_id, isLoggedIn]); // Thêm isLoggedIn vào dependency array

    // Effect để kiểm tra trạng thái đăng nhập khi component mount
    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);
    
    // Effect để gọi fetchData khi dependencies thay đổi
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi</div>;
    // Đảm bảo matchId được truyền vào là hợp lệ
    const handleUpdateClick = (e, matchId) => {
        e.stopPropagation(); // Ngăn sự kiện click lan truyền lên Link (nếu có)
        e.preventDefault(); // Ngăn hành vi mặc định của Link
        
        console.log("DEBUG: handleUpdateClick called for matchId:", matchId); // Log ngay khi hàm được gọi

        if (matchId) {
            console.log(`DEBUG: Navigating to /tournament/${tournament_id}/matches/${matchId}/edit`); // Log trước khi navigate
            navigate(`/tournament/${tournament_id}/matches/${matchId}/edit`);
        } else {
            console.error("Match ID is undefined. Cannot navigate to edit page.");
            window.alert("Không thể cập nhật trận đấu. ID trận đấu không hợp lệ.");
        }
    };
    
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


    // Hàm render danh sách trận đấu hoặc thông báo
    const renderMatchList = () => {
        if (!hasTournamentStarted) {
            return (
                <div className={styles.noScheduleMessage}>
                    <h2>Chưa xếp lịch thi đấu</h2>
                    <p>Lịch đấu sẽ được công bố sau khi giải đấu bắt đầu.</p>
                </div>
            );
        }

        // Lọc chỉ những match có người chơi thật (loại bỏ placeholder và BYE thuần túy)
        const scheduledMatches = matches.filter(match => match.players.length > 0);
        console.log("DEBUG: Filtered scheduledMatches:", scheduledMatches); // Log sau khi lọc

        if (scheduledMatches.length === 0) {
            return (
                <div className={styles.noScheduleMessage}>
                    <h2>Chưa có trận đấu nào được tạo hoặc xếp lịch</h2>
                    <p>Vui lòng tạo bảng đấu để xem danh sách các trận đấu.</p>
                </div>
            );
        }

        // Nhóm các trận đấu theo ngày
        const matchesGroupedByDate = scheduledMatches.reduce((acc, match) => {
            const date = new Date(match.occurence_day).toLocaleDateString('vi-VN'); 
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(match);
            acc[date].sort((a, b) => a.round - b.round || a.id.localeCompare(b.id)); 
            return acc;
        }, {});

        const sortedDates = Object.keys(matchesGroupedByDate).sort((a, b) => {
            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('/').map(Number);
                return new Date(year, month - 1, day);
            };
            return parseDate(a).getTime() - parseDate(b).getTime();
        });


        return (
            <div className={styles.matchListContainer}>
                {sortedDates.map(date => (
                    <div key={date} className={styles.dateGroup}>
                        <h3 className={styles.dateHeader}>{date}</h3>
                        <div className={styles.matchGroup}>
                            {matchesGroupedByDate[date].map(match => (
                                <div
                                    key={match.id}
                                    className={styles.matchCard}
                                    onClick={() => navigate(`/tournament/${tournament_id}/matches/${match.id}`)}
                                >
                                    <div className={styles.matchPlayersAndScores}>
                                        {match.players.length > 0 && (
                                            match.players.map((playerID, pIdx) => {
                                                const result = match.results.find(r => r.player === playerID);
                                                let scoreDisplay;

                                                if (match.status === 'pending') {
                                                    scoreDisplay = <i style={{ fontStyle: 'italic' }}>chưa có điểm</i>;
                                                } else if (match.status === 'completed') {
                                                    scoreDisplay = result ? `${result.score}đ` : 'N/A';
                                                } else {
                                                    scoreDisplay = result ? `${result.score}đ` : 'Chưa đấu';
                                                }
                                                
                                                return (
                                                    <div key={pIdx} className={styles.playerEntry}>
                                                        <span className={styles.playerName}>{getPlayerName(playerID)}</span>
                                                        <span className={styles.playerScore}>{scoreDisplay}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div className={styles.matchTimeContainer}>
                                            <span className={styles.matchTime}>
                                                Thời gian: {new Date(match.occurence_day).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    {match.status === 'completed' && (
                                         <div className={`${styles.matchStatusBadge} ${styles.completed}`}>Đã kết thúc</div>
                                    )}
                                    {match.status === 'pending' && (
                                         <div className={`${styles.matchStatusBadge} ${styles.pending}`}>Sắp diễn ra</div>
                                    )}
                                    {match.status === 'completed' && match.players.length === 1 && (
                                        <div className={`${styles.matchStatusBadge} ${styles.bye}`}>BYE</div>
                                    )}
                                    {/* if(isLoggedIn)
                                    <button
                                        className={styles.updateBtn}
                                        onClick={(e) => {
                                            console.log("DEBUG: Button clicked, match.id:", match.id); // Log ngay khi nút được click
                                            handleUpdateClick(e, match.id);
                                        }}
                                    >
                                        Cập nhật
                                    </button> */}
                                    {isLoggedIn && match.players.length === 2 && (
                                        <button
                                            className={styles.updateBtn}
                                            onClick={(e) => {
                                                console.log("DEBUG: Button clicked, match.id:", match.id);
                                                handleUpdateClick(e, match.id);
                                            }}
                                        >
                                            Cập nhật
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.pageWrapper}>
            {tournament && ( 
                <div className={styles["banner"]}>
                    <img
                        src={tournament?.image?.startsWith('http') ? tournament.image : `/${tournament?.image || 'images/default-banner.jpg'}`}
                        alt={tournament?.title || 'Tournament Banner'}
                    />
                </div>
            )}

            {tournament && (
                <div className={styles["info-section"]}>
                    <h1>{tournament.title}</h1>
                    <p>
                        {/* {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()} */}
                        {tournament.start_date} - {tournament.end_date}
                    </p>
                    <p>{tournament.participants || 0} Participants</p>
                </div>
            )}

            {tournament && (
                <div className={styles["tabs"]}>
                    <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
                    <button className={styles.activeTab}>🎮 Các trận đấu</button>
                </div>
            )}

            {renderMatchList()}

        </div>
    );
}

export default TournamentDetailsMatch;
