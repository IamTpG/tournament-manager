import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "./TournamentDetail.module.css"

function TournamentDetail() {
  const { tournament_id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      const token = localStorage.getItem("jwtToken");

      try {
        // Try fetching from admin route first
        const res = await axios.get(`http://localhost:5000/api/admin/tournament/${tournament_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        
        setTournament(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // If unauthorized, fallback to public route
          try {
            const res = await axios.get(`http://localhost:5000/api/tournament/${tournament_id}`)
            
            setTournament(res.data);
          } catch (fallbackErr) {
            console.error('[Fallback Fetch Failed]', fallbackErr);
          }
        } else {
          console.error('[Fetch Error]', err);
        }
      }
    };

    fetchTournament();
  }, [tournament_id]);

  if (!tournament) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="tournament-detail">
      {/* Banner */}
      <div className={styles["banner"]}> 
        <img src={tournament.image} alt={tournament.title} />
      </div>

      {/* Title and Info */}
      <div className={styles["info-section"]}>
        <h1>{tournament.title}</h1>
        <p>
          {tournament.start_date} - {tournament.end_date}
        </p>
        <p>{tournament.participants || 0} Participants</p>
        <p>{tournament.description}</p>
      </div>

      <div className={styles["tabs"]}> 
        <button onClick={() => navigate(`/tournament/${tournament_id}/rank`)}>📊 Bảng thi đấu</button>
        <button onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>🎮 Các trận đấu</button>
      </div>
    </div>
  );
}

export default TournamentDetail;
