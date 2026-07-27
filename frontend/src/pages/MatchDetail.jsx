import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './MatchDetail.module.css';
import newstyles from './TournamentDetail.module.css';

const DEFAULT_AVATAR = 'https://via.placeholder.com/60?text=Avt';

function MatchDetail() {
  const { tournament_id, matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm để tìm tên người chơi từ ID, cùng cách với TournamentDetail_Matches.jsx / EditMatch.jsx
  const getPlayerName = useCallback((playerId) => {
    if (!playerId) return 'TBD';
    if (playerId.startsWith('BYE_PLAYER_')) return 'BYE';
    const player = players.find(p => p.id === playerId);
    return player ? player.name_in_tournament : playerId;
  }, [players]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tournamentRes, matchRes, playersRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/admin/tournament/${tournament_id}`),
          axios.get(`http://localhost:5000/api/admin/match/${matchId}`),
          axios.get(`http://localhost:5000/api/tournament/${tournament_id}/players_approved`),
        ]);

        setTournament(tournamentRes.data);
        setMatch(matchRes.data);
        setPlayers(playersRes.data);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Không thể tải thông tin chi tiết. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournament_id, matchId]);

  const handleUpdate = () => {
    navigate(`/tournament/${tournament_id}/matches/${matchId}/edit`);
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!match || !tournament) return <div className={styles.error}>Không tìm thấy thông tin trận đấu hoặc giải đấu.</div>;

  // tournament.start_date đến từ backend dưới dạng chuỗi "DD/MM/YYYY" (đã format sẵn),
  // không thể dùng thẳng với `new Date()`. Cùng cách xử lý với TournamentDetail_Bracket.jsx.
  const convertToValidDateObject = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const tournamentStartDate = convertToValidDateObject(tournament.start_date);
  const hasTournamentStarted = tournamentStartDate && new Date() >= tournamentStartDate;

  if (!hasTournamentStarted) {
    return (
      <div className={styles.matchDetailPage}>
        <div className={newstyles["banner"]}>
          <img
            src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
            alt={tournament.title}
          />
        </div>
        <div className={newstyles["info-section"]}>
          <h1>{tournament.title}</h1>
          <p>
            {tournament.start_date} - {tournament.end_date}
          </p>
          <p>{tournament.participants || 0} Participants</p>
        </div>
        <div className={styles.noScheduleMessage} style={{marginTop: '50px'}}>
          <h2>Trận đấu chưa diễn ra</h2>
          <p>Chi tiết trận đấu sẽ được hiển thị sau khi trận đấu bắt đầu.</p>
        </div>
      </div>
    );
  }

  const player1Id = match.players[0];
  const player2Id = match.players[1];
  // Match với đúng 1 người chơi thật là trận BYE tự động thắng
  const player1Name = getPlayerName(player1Id);
  const player2Name = match.players.length === 1 ? 'BYE' : getPlayerName(player2Id);

  const getScore = (playerId) => {
    if (!playerId) return 0;
    const result = match.results?.find(r => r.player === playerId);
    return result ? result.score : 0;
  };

  const matchTime = match.occurence_day
    ? `${new Date(match.occurence_day).toLocaleDateString('vi-VN')} lúc ${new Date(match.occurence_day).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Chưa xác định';

  // Nếu giải đấu đã bắt đầu, hiển thị chi tiết trận đấu
  return (
    <div className={styles.matchDetailPage}>
      <div className={styles["tournament-detail"]}>
        <div className={newstyles["banner"]}>
          <img
            src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
            alt={tournament.title}
          />
        </div>

        <div className={newstyles["info-section"]}>
          <h1>{tournament.title}</h1>
          <p>
            {tournament.start_date} - {tournament.end_date}
          </p>
          <p>{tournament.participants || 0} Participants</p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.matchCard}>
          <div className={styles.matchInfo}>
            <div className={styles.player}>
              <img src={DEFAULT_AVATAR} alt="Player 1 Avatar" className={styles.playerAvatar} />
              <span>{player1Name}</span>
            </div>
            <span className={styles.vsText}>Vs</span>
            <div className={styles.player}>
              <span>{player2Name}</span>
              <img src={DEFAULT_AVATAR} alt="Player 2 Avatar" className={styles.playerAvatar} />
            </div>
          </div>
          <div className={styles.scoreTime}>
            <div className={styles.score}>{getScore(player1Id)} : {getScore(player2Id)}</div>
            <div className={styles.time}>{matchTime}</div>
          </div>
          <button className={styles.updateButton} onClick={handleUpdate}>Cập Nhật</button>
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;
