import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css'; // Dùng chung style

function MatchEditPage() {
    // Log này sẽ chạy ngay khi component này được render
    console.log("DEBUG: MatchEdit component rendered."); 
    const { tournament_id, match_id } = useParams();
    // Log giá trị của tournament_id và match_id ngay sau khi lấy từ URL
    console.log("DEBUG: useParams values - tournament_id:", tournament_id, "match_id:", match_id); 

    const navigate = useNavigate();

    // SỬA LỖI Ở ĐÂY: Sử dụng useState({}) thay vì {}
    const [match, setMatch] = useState(null);
    const [players, setPlayers] = useState([]); // Danh sách tất cả người chơi trong giải đấu để map ID -> Tên
    const [playerScores, setPlayerScores] = useState({}); // Lưu điểm số của từng người chơi theo playerID
    const [matchStatus, setMatchStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false); // Trạng thái khi đang lưu

    // Hàm để tìm tên người chơi từ ID
    const getPlayerName = useCallback((playerId) => {
        const player = players.find(p => p.id === playerId);
        if (playerId && playerId.startsWith('BYE_PLAYER_')) {
            return 'BYE';
        }
        return player ? player.name_in_tournament : playerId; 
    }, [players]);

    // Fetch dữ liệu match và thông tin người chơi khi component mount
    useEffect(() => {
        const fetchData = async () => {
            console.log("DEBUG: fetchData in MatchEdit is called."); // Log khi fetchData bắt đầu

            const token = localStorage.getItem("jwtToken");
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            // THÊM KIỂM TRA ĐIỀU KIỆN CHO match_id TRƯỚC KHI FETCH
            // Nếu match_id là undefined, chúng ta sẽ thiết lập lỗi và thoát sớm
            if (!match_id) {
                console.error("ERROR: match_id is undefined in MatchEdit's fetchData. Cannot fetch match details.");
                setError("ID trận đấu không hợp lệ. Không thể tải thông tin.");
                setLoading(false);
                return; // Thoát sớm nếu match_id không hợp lệ
            }

            try {
                setLoading(true);
                setError(null);

                // Lấy thông tin match cụ thể
                console.log(`DEBUG: Attempting to fetch match from: http://localhost:5000/api/admin/match/${match_id}`);
                const matchRes = await axios.get(
                    `http://localhost:5000/api/admin/match/${match_id}`,
                    config
                );
                const fetchedMatch = matchRes.data;
                setMatch(fetchedMatch);
                setMatchStatus(fetchedMatch.status);
                console.log("DEBUG: Match data fetched in MatchEdit:", fetchedMatch);
                
                // Khởi tạo playerScores từ dữ liệu match hiện có
                const initialScores = {};
                if (fetchedMatch.results && Array.isArray(fetchedMatch.results)) {
                    fetchedMatch.results.forEach(res => {
                        initialScores[res.player] = res.score;
                    });
                } else if (fetchedMatch.players && Array.isArray(fetchedMatch.players)) {
                    // Nếu chưa có results, khởi tạo điểm 0 cho tất cả player trong match
                    fetchedMatch.players.forEach(pId => {
                        initialScores[pId] = 0;
                    });
                }
                setPlayerScores(initialScores);
                console.log("DEBUG: Initial player scores set:", initialScores);

                // Lấy danh sách tất cả người chơi trong giải đấu để map ID sang tên
                console.log(`DEBUG: Attempting to fetch players for tournament: ${tournament_id}`);
                const playersRes = await axios.get(
                    `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
                    config
                );
                setPlayers(playersRes.data);
                console.log("DEBUG: Players data fetched in MatchEdit:", playersRes.data);


            } catch (err) {
                console.error("ERROR: Failed to fetch match or players data in MatchEdit:", err); // Log lỗi chi tiết hơn
                if (err.response && err.response.status === 401) {
                    setError("Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                } else if (err.response && err.response.status === 404) {
                    setError("Không tìm thấy trận đấu với ID này. Vui lòng kiểm tra lại.");
                }
                else {
                    setError("Không thể tải thông tin trận đấu. Vui lòng thử lại.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tournament_id, match_id]); // Dependency array: fetchData sẽ chạy lại khi tournament_id hoặc match_id thay đổi

    // Xử lý thay đổi điểm số của người chơi
    const handleScoreChange = (playerId, score) => {
        setPlayerScores(prevScores => ({
            ...prevScores,
            [playerId]: score === '' ? '' : Number(score) // Chuyển sang số, giữ rỗng nếu nhập rỗng
        }));
    };

    // Xử lý lưu kết quả
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        // Chuẩn bị payload data
        const resultsArray = Object.keys(playerScores).map(playerId => ({
            player: playerId,
            score: playerScores[playerId] === '' ? 0 : playerScores[playerId] // Đảm bảo score là số khi gửi đi
        }));

        const payload = {
            results: resultsArray,
            status: matchStatus,
        };
        console.log("DEBUG: Saving match data with payload:", payload);

        try {
            await axios.put(
                `http://localhost:5000/api/admin/match/${match_id}/results`, // Đảm bảo đúng endpoint PUT cho kết quả
                payload,
                config
            );
            window.alert('Cập nhật kết quả trận đấu thành công!');
            navigate(`/tournament/${tournament_id}/matches`); // Quay lại trang danh sách trận đấu
        } catch (err) {
            console.error("ERROR: Failed to save match result:", err);
            window.alert(`Có lỗi xảy ra khi lưu kết quả: ${err.response?.data?.message || err.message}`);
            setError("Lỗi khi lưu kết quả. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    // Các điều kiện render sớm để hiển thị trạng thái loading/error/not found
    if (loading) return <div className="loading">Đang tải thông tin trận đấu...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!match) return <div className="loading">Không tìm thấy trận đấu.</div>;
    // Kiểm tra thêm trường hợp match có nhưng không có người chơi (mặc dù với logic tạo match mới, trường hợp này hiếm)
    if (match.players.length === 0) return <div className="loading">Trận đấu này chưa có người chơi. Không thể cập nhật điểm.</div>;


    return (
        <div className={styles.pageWrapper}>
            <div className={styles["info-section"]}>
                <h1 className={styles.centeredTitle}>Cập nhật trận đấu</h1>
                <p className={styles.centeredSubTitle}>
                    Vòng {match.round} ({match.bracket_type === 'winners' ? 'Nhánh thắng' : match.bracket_type === 'losers' ? 'Nhánh thua' : 'Chung kết tổng'})
                </p>
                <p className={styles.centeredSubTitle}>
                    Ngày: {new Date(match.occurence_day).toLocaleDateString('vi-VN')} lúc {new Date(match.occurence_day).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            <form onSubmit={handleSave} className={styles.matchEditForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="matchStatus">Trạng thái trận đấu</label>
                    <select
                        id="matchStatus"
                        className={styles.formControl}
                        value={matchStatus}
                        onChange={(e) => setMatchStatus(e.target.value)}
                    >
                        <option value="pending">Sắp diễn ra</option>
                        <option value="completed">Đã kết thúc</option>
                        {/* Thêm các trạng thái khác nếu có như 'ongoing' */}
                    </select>
                </div>

                {match.players.map(playerId => (
                    <div className={styles.formGroup} key={playerId}>
                        <label htmlFor={`score-${playerId}`}>
                            Cập nhật điểm số cho {getPlayerName(playerId)}
                        </label>
                        <input
                            type="number"
                            id={`score-${playerId}`}
                            className={styles.formControl}
                            value={playerScores[playerId] === undefined ? '' : playerScores[playerId]}
                            onChange={(e) => handleScoreChange(playerId, e.target.value)}
                            min="0" // Đảm bảo điểm không âm
                        />
                    </div>
                ))}

                <button type="submit" className={styles.saveButton} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button type="button" className={styles.cancelButton} onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>
                    Hủy
                </button>
            </form>
        </div>
    );
}

export default MatchEditPage;
