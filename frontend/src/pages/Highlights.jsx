import HighlightCard from "../components/HighlightCard";

import styles from "./Highlights.module.css";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
    
        // Try admin route first
        const res = await axios.get('http://localhost:5000/api/admin/highlight', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
    
        setHighlights(res.data);
      } catch (err) {
        // If unauthorized, fallback to public route
        if (err.response && err.response.status === 401) {
          try {
            const res = await axios.get('http://localhost:5000/api/highlight');
            setHighlights(res.data);
          } catch (fallbackErr) {
            console.error('Fallback fetch (public) failed:', fallbackErr);
          }
        } else {
          console.error('Failed to fetch highlights:', err);
        }
      }
    };

    fetchHighlights();
  }, []);

  const isLoggedIn = !!localStorage.getItem("jwtToken");
  
  return (
    <>
      <div className={styles["highlight-layout"]}>
        <div className={styles["card-grid-wrapper"]}>
          <div className={styles["card-grid"]}>
          {highlights.map((item, index) => (
            <HighlightCard key={index} {...item} />
          ))}
          </div>
        </div>

        <div className={styles["highlight-sidebar"]}>
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
