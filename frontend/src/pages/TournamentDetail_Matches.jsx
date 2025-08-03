import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css';
function TournamentDetailsMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/admin/tournament/${id}`)
      .then(res => setTournament(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!tournament) return <div className="loading">Đang tải...</div>;

  const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

  const handleUpdateClick = (e, matchId) => {
    e.stopPropagation();

    e.preventDefault(); 

    navigate(`/tournament/${id}/matches/${matchId}/edit`);
  };

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
    
    const mockMatches = [
      {
        id: "match-001",
        player1: "Kỳ Thủ An",
        player2: "Kỳ Thủ Bình",
        startTime: "10:00 25/07/2025", 
        status: "Đã kết thúc",
        score: "3-1"
      },
      {
        id: "match-002",
        player1: "Kỳ Thủ Cường",
        player2: "Kỳ Thủ Dũng",
        startTime: "14:30 30/07/2025",
        status: "Đã kết thúc",
        score: "2-0"
      },
      {
        id: "match-003",
        player1: "Kỳ Thủ Giang",
        player2: "Kỳ Thủ Hải",
        startTime: "09:00 01/08/2025", 
        status: "Sắp diễn ra",
        score: "Chưa đấu"
      },
      {
        id: "match-004",
        player1: "Kỳ Thủ Khoa",
        player2: "Kỳ Thủ Long",
        startTime: "11:00 05/08/2025", 
        status: "Sắp diễn ra",
        score: "Chưa đấu"
      },
      {
        id: "match-005",
        player1: "Kỳ Thủ Mai",
        player2: "Kỳ Thủ Nam",
        startTime: "16:00 10/08/2025", 
        status: "Sắp diễn ra",
        score: "Chưa đấu"
      },
      {
        id: "match-006",
        player1: "Kỳ Thủ Oanh",
        player2: "Kỳ Thủ Phong",
        startTime: "10:00 15/08/2025", // Sắp diễn ra
        status: "Sắp diễn ra",
        score: "Chưa đấu"
      },
    ];
    return (
      <div className={styles.matchList}>
        {mockMatches.map(match => (
          <Link
            key={match.id}
            to={`/tournament/${id}/matches/${match.id}`} 
            className={styles.matchCardLink} 
          >
            <div className={styles.matchCard}>
              <div className={styles.matchInfo}>
                <span>{match.player1}</span>
                <span>Vs</span>
                <span>{match.player2}</span>
                <span className={styles.matchTime}>TG Bắt Đầu: {match.startTime}</span>
              </div>
              <button
                className={styles.updateBtn}
                onClick={(e) => handleUpdateClick(e, match.id)}
              >
                Cập nhật
              </button>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}> 
      {/* Banner */}
      <div className={styles["banner"]}>
        <img
          src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
          alt={tournament.title}
        />
      </div>

      {/* Title and Info */}
      <div className={styles["info-section"]}> 
        <h1>{tournament.title}</h1>
        <p>
          {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
        </p>
        <p>{tournament.participants || 0} Participants</p>
      </div>

      {/* Tabs */}
      <div className={styles["tabs"]}>
        <button onClick={() => navigate(`/tournament/${id}/rank`)}>📊 Bảng thi đấu</button>
        <button className={styles.activeTab}>🎮 Các trận đấu</button>
      </div>

      {renderMatchList()}

    </div>
  );
}

export default TournamentDetailsMatch;