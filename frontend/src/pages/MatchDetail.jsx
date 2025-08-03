import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HighlightCard from '../components/HighlightCard';
import styles from './MatchDetail.module.css'; 
import newstyles from './TournamentDetail.module.css' 

// Dữ liệu giả lập highlights
const allHighlights = [
  {
    title: "Chess EArena 2025",
    description: "Magnus Carlsen tung đòn chiếu hết chỉ sau 21 nước đi – khiến Ian Nepomniach-Tchi không kịp xoay chuyển thế trận.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQXRKq9Cfz5UNO1W_JW5S9wAebfFqv19OJqQ&s",
    link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
  },
  {
    title: "Valorant Spike Masters",
    description: "TenZ thể hiện kỹ năng siêu tốc với pha clutch 1 vs 3 ở map Ascent, hạ đối thủ chỉ trong 7 giây!",
    image: "https://images3.alphacoders.com/136/1361411.jpeg",
    link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
  },
  {
    title: "PUBG Tournament By Red Bull",
    description: "Vào vòng bo cuối, xQc bật ngược thế trận khi chỉ còn 1 máu, headshot cực chuẩn hạ Shroud giành Top 1.",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_616x353.jpg",
    link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
  },
];

// Dữ liệu giả lập chi tiết trận đấu
const mockMatchDetails = {
  player1Name: "Kỳ Thủ 1",
  player2Name: "Kỳ Thủ 2",
  player1Avatar: "https://via.placeholder.com/60?text=Avt",
  player2Avatar: "https://via.placeholder.com/60?text=Avt",
  score1: 3,
  score2: 1,
  time: "13:00 10/06/2025 - 14:34 10/06/25",
  highlightLinks: [
    { timestamp: "07:48", content: "Nội dung mới nhất" },
    { timestamp: "05:56", content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
    { timestamp: "03:34", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { timestamp: "02:44", content: "Lorem ipsum dolor sit amet" },
    { timestamp: "01:34", content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { timestamp: "00:40", content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  ]
};


function MatchDetail() {
  const { id, matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const tournamentRes = await axios.get(`http://localhost:3000/api/admin/tournament/${id}`);
        setTournament(tournamentRes.data);
        setMatch(mockMatchDetails);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Không thể tải thông tin chi tiết. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, matchId]);

  const handleUpdate = () => {
    navigate(`/tournament/${id}/matches/${matchId}/edit`);
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!match || !tournament) return <div className={styles.error}>Không tìm thấy thông tin trận đấu hoặc giải đấu.</div>;

  const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

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
            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
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
            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
          </p>
          <p>{tournament.participants || 0} Participants</p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.matchCard}>
          <div className={styles.matchInfo}>
            <div className={styles.player}>
              <img src={match.player1Avatar} alt="Player 1 Avatar" className={styles.playerAvatar} />
              <span>{match.player1Name}</span>
            </div>
            <span className={styles.vsText}>Vs</span>
            <div className={styles.player}>
              <span>{match.player2Name}</span>
              <img src={match.player2Avatar} alt="Player 2 Avatar" className={styles.playerAvatar} />
            </div>
          </div>
          <div className={styles.scoreTime}>
            <div className={styles.score}>{match.score1} : {match.score2}</div>
            <div className={styles.time}>{match.time}</div>
          </div>
          <button className={styles.updateButton} onClick={handleUpdate}>Cập Nhật</button>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Highlights</h2>
          <div className={styles.highlightGrid}>
            {allHighlights.slice(0, 3).map((item, index) => (
              <HighlightCard key={index} {...item} />
            ))}
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Diễn biến</h2>
          <div className={styles.timeline}>
            {match.highlightLinks.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <span className={styles.timestamp}>[{item.timestamp}]</span>
                <span className={styles.eventContent}>{item.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;
