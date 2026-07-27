import TournamentCard from "../components/TournamentCard";

import styles from "./Tournaments.module.css";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
    
        // Try the admin route first
        const res = await axios.get('http://localhost:5000/api/admin/tournament', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        const tournamentsWithCount = await Promise.all(
          res.data.map(async (tournament) => {
            try {
              const countRes = await axios.get(`http://localhost:5000/api/tournament/${tournament.id}/participants/count`);
              return { ...tournament, participants: countRes.data.current };
            } catch (err) {
              console.error(`Failed to fetch count for tournament ${tournament.id}:`, err);
              return { ...tournament, participants: 0 };
            }
          })
        );
    
        setTournaments(tournamentsWithCount);
    
      } catch (err) {
        if (err.response && err.response.status === 401) {
          try {
            // Fallback to public route
            const res = await axios.get('http://localhost:5000/api/tournament');
    
            const tournamentsWithCount = await Promise.all(
              res.data.map(async (tournament) => {
                try {
                  const countRes = await axios.get(`http://localhost:5000/api/tournament/${tournament.id}/participants/count`);
                  return { ...tournament, participants: countRes.data.current };
                } catch (err) {
                  console.error(`Failed to fetch count for tournament ${tournament.id}:`, err);
                  return { ...tournament, participants: 0 };
                }
              })
            );
    
            setTournaments(tournamentsWithCount);
          } catch (fallbackErr) {
            console.error('Fallback fetch (public) failed:', fallbackErr);
          }
        } else {
          console.error('Failed to fetch tournaments:', err);
        }
      }
    };
    

    fetchTournaments();
  }, []);

  const isLoggedIn = !!localStorage.getItem("jwtToken");
  
  return (
    <>
      <div className={styles["tournament-layout"]}>
        <div className={styles["card-grid-wrapper"]}>
          <div className={styles["card-grid"]}>
          {tournaments.map((item, index) => (
            <TournamentCard key={index} {...item} isLoggedIn={isLoggedIn} />
          ))}
          </div>
        </div>

        <div className={styles["tournament-sidebar"]}>
          <h2>Sắp xếp bởi</h2>
          <button>Thời gian</button>
          <button>Thể thức</button>

          <h2>Trò chơi</h2>
          <div className={styles["icon-grid"]}>
            <img src="src/assets/mock-icons/lol.png" alt="LoL" />
            <img src="src/assets/mock-icons/pubg.png" alt="PUBG" />
            <img src="src/assets/mock-icons/overwatch.png" alt="OW" />
            <img src="src/assets/mock-icons/clash.png" alt="Clash" />
            <img src="src/assets/mock-icons/cod.jpg" alt="COD" />
            <img src="src/assets/mock-icons/fornite.png" alt="Fornite" />
            <img src="src/assets/mock-icons/gwent.png" alt="Gwent" />
          </div>

          <h2>Nền tảng</h2>
          <div className={styles["icon-grid"]}>
            <img src="src/assets/mock-icons/playstation.jpg" alt="PS" />
            <img src="src/assets/mock-icons/steam.png" alt="Steam" />
            <img src="src/assets/mock-icons/xbox.png" alt="Xbox" />
          </div>
        </div>
      </div>
    </>
  );
}
