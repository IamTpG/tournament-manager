import HighlightCard  from "../components/HighlightCard";
import TournamentCard from "../components/TournamentCard";
import NewsCard       from '../components/NewsCard';
import SideNewsCard   from '../components/SideNewsCard'

import styles from './Home.module.css'

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [news, setNews] = useState([]);

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
    

    const fetchNews = async () => {
      try {
        const token = localStorage.getItem('jwtToken');

        // Try admin route first
        const res = await axios.get('http://localhost:5000/api/admin/news', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setNews(res.data);
      } catch (err) {
        // If unauthorized, fallback to public route
        if (err.response && err.response.status === 401) {
          try {
            const res = await axios.get('http://localhost:5000/api/news');
            setNews(res.data);
          } catch (fallbackErr) {
            console.error('Fallback fetch (public) failed:', fallbackErr);
          }
        } else {
          console.error('Failed to fetch news:', err);
        }
      }
    };

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
    
    fetchNews();
    fetchHighlights();
    fetchTournaments();
  }, []);

  const isLoggedIn = !!localStorage.getItem("jwtToken");

  return (
    <>
      <section className={styles["news-display"]}>
        <h2 className={styles["title"]}> ⭐ Tin Nổi Bật</h2>
        <div className={styles["news-wrapper"]}>
          <div className={styles["news-grid"]}>
            <NewsCard {...news[0]} />
            <div className={styles["side-news"]}>
              {news.slice(1, 4).map((item, index) => (
                <SideNewsCard key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles["card-display"]}>
        <h2 className={styles["title"]}>⭐ Highlights</h2>
        <div className={styles["card-grid-wrapper"]}>
          <div className={styles["card-grid"]}>
            {highlights.slice(0, 3).map((item, index) => (
              <HighlightCard key={index} {...item} />
            ))}
          </div>
        </div>

        <h2 className={styles["title"]}>⭐ Giải đấu</h2>
        <div className={styles["card-grid-wrapper"]}>
          <div className={styles["card-grid"]}>
            {tournaments.slice(0, 3).map((item, index) => (
              <TournamentCard key={index} {...item} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        </div>
        
      </section>
    </>
  );
}