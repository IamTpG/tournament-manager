import HighlightCard from "../components/HighlightCard";
import TournamentCard from "../components/TournamentCard";
import NewsCard from '../components/NewsCard';
import SideNewsCard from '../components/SideNewsCard'

import styles from './Home.module.css'

import { useEffect, useState } from 'react';
import axios from 'axios';

// ---------------------------- Mock data ----------------------------

// const news = [
// {
//   title: 'PUBG Tournament By Red Bull chính thức cán mốc 10.000 lượt đăng kí chỉ sau 3 ngày!',
//   description: 'Sự kiện đang được mong chờ nhất mùa hè đã đạt được con số đăng ký kỷ lục, hứa hẹn những trận đấu nảy lửa',
//   image: "src/assets/mock-imgs/pubg-banner.jpg",
//   link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
// },
// {
//   title: '1 PUBG Tournament By Red Bull chính thức cán mốc 10.000 lượt đăng kí chỉ sau 3 ngày!',
//   description: 'Sự kiện đang được mong chờ nhất mùa hè đã đạt được con số đăng ký kỷ lục, hứa hẹn những trận đấu nảy lửa',
//   image: "src/assets/mock-imgs/pubg-banner.jpg",
//   link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
// },
// {
//   title: '2 PUBG Tournament By Red Bull chính thức cán mốc 10.000 lượt đăng kí chỉ sau 3 ngày!',
//   description: 'Sự kiện đang được mong chờ nhất mùa hè đã đạt được con số đăng ký kỷ lục, hứa hẹn những trận đấu nảy lửa',
//   image: "src/assets/mock-imgs/pubg-banner.jpg",
//   link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
// },
// {
//   title: '3 PUBG Tournament By Red Bull chính thức cán mốc 10.000 lượt đăng kí chỉ sau 3 ngày!',
//   description: 'Sự kiện đang được mong chờ nhất mùa hè đã đạt được con số đăng ký kỷ lục, hứa hẹn những trận đấu nảy lửa',
//   image: "src/assets/mock-imgs/pubg-banner.jpg",
//   link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
// },
// {
//   title: '4 PUBG Tournament By Red Bull chính thức cán mốc 10.000 lượt đăng kí chỉ sau 3 ngày!',
//   description: 'Sự kiện đang được mong chờ nhất mùa hè đã đạt được con số đăng ký kỷ lục, hứa hẹn những trận đấu nảy lửa',
//   image: "src/assets/mock-imgs/pubg-banner.jpg",
//   link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
// },
// ];

// const highlights = [
//   {
//     title: "Chess EArena 2025",
//     description: "Magnus Carlsen tung đòn chiếu hết chỉ sau 21 nước đi – khiến Ian Nepomniach-Tchi không kịp xoay chuyển thế trận.",
//     image: "src/assets/mock-imgs/chess-highlight.png",
//     link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
//   },
//   {
//     title: "Valorant Spike Masters",
//     description: "TenZ thể hiện kỹ năng siêu tốc với pha clutch 1 vs 3 ở map Ascent, hạ đối thủ chỉ trong 7 giây!",
//     image: "src/assets/mock-imgs/valorant-highlight.jpg",
//     link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
//   },
//   {
//     title: "PUBG Tournament By Red Bull",
//     description: "Vào vòng bo cuối, xQc bật ngược thế trận khi chỉ còn 1 máu, headshot cực chuẩn hạ Shroud giành Top 1.",
//     image: "src/assets/mock-imgs/pubg-highlight.jpg",
//     link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
//   },
//   {
//     title: "PUBG Tournament By Red Bull",
//     description: "",
//     image: "src/assets/mock-imgs/pubg-highlight.jpg",
//     link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
//   },
//   {
//     title: "Chess EArena 2025",
//     description: "",
//     image: "src/assets/mock-imgs/chess-highlight.png",
//     link: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
//   },
// ];

// const tournaments = [
//   {
//     title: "PUBG Tournament By Red Bull",
//     description: "",
//     start_date: "2025-07-09",
//     end_date: "2025-08-09",
//     participants: 100,
//     image: "src/assets/mock-imgs/pubg-2.jpg",
//   },
//   {
//     title: "Chess EArena 2025",
//     description: "",
//     image: "src/assets/mock-imgs/chess-2.png",
//     start_date: "2025-07-09",
//     end_date: "2025-08-09",
//     participants: 64,
//   },
//   {
//     title: "Valorant 2025",
//     description: "",
//     image: "src/assets/mock-imgs/valorant-2.jpg",
//     start_date: "2025-07-09",
//     end_date: "2025-08-09",
//     participants: 48,
//   },
// ];

// -------------------------------------------------------------------


export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [articles, setArticles] = useState([]);

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
    

    const fetchArticles = async () => {
      
      try {
        const token = localStorage.getItem('jwtToken');

        // Try admin route first
        const res = await axios.get('http://localhost:5000/api/admin/article', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setArticles(res.data);
      } catch (err) {
        // If unauthorized, fallback to public route
        if (err.response && err.response.status === 401) {
          try {
            const res = await axios.get('http://localhost:5000/api/article');
            setArticles(res.data);
          } catch (fallbackErr) {
            console.error('Fallback fetch (public) failed:', fallbackErr);
          }
        } else {
          console.error('Failed to fetch articles:', err);
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
    
    fetchArticles();
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
            <NewsCard {...articles[0]} />
            <div className={styles["side-news"]}>
              {articles.slice(1, 4).map((item, index) => (
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