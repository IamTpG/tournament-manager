import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "./TournamentDetail.module.css"

function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/admin/tournament/${id}`)
      .then(res => setTournament(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!tournament) return <div className="loading">Loading...</div>;

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
          {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
        </p>
        <p>{tournament.participants || 0} Participants</p>
        <p>{tournament.description}</p>
      </div>

      <div className={styles["tabs"]}> 
        <button onClick={() => navigate(`/tournament/${id}/rank`)}>📊 Bảng thi đấu</button>
        <button onClick={() => navigate(`/tournament/${id}/matches`)}>🎮 Các trận đấu</button>
      </div>
    </div>
  );
}

export default TournamentDetail;
