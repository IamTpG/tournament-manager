// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import styles from './TournamentDetail.module.css';

// function TournamentDetailsMatch() {
//   const { tournament_id } = useParams();
//   const navigate = useNavigate();

//   const [tournament, setTournament] = useState(null);
//   const [matches, setMatches] = useState([]); // thêm matches state

//   useEffect(() => {
//     // Lấy thông tin tournament
//     axios.get(`http://localhost:5000/api/admin/tournament/${tournament_id}`)
//       .then(res => setTournament(res.data))
//       .catch(err => {
//         console.error('Error loading tournament:', err);
//         setTournament(null);
//       });

//     // Lấy danh sách trận đấu
//     axios.get(`http://localhost:5000/api/admin/${tournament_id}/matches`)
//       .then(res => setMatches(res.data))
//       .catch(err => {
//         console.error('Error loading matches:', err);
//         setMatches([]);
//       });
//   }, [tournament_id]);

//   if (!tournament) return <div className="loading">Đang tải...</div>;


//   const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

//   const handleUpdateClick = (e, matchId) => {
//     e.stopPropagation();

//     e.preventDefault(); 

//     navigate(`/tournament/${tournament_id}/matches/${matchId}/edit`);
//   };

//   // Hàm render danh sách trận đấu hoặc thông báo
//   const renderMatchList = () => {
//     if (!hasTournamentStarted) {
//       return (
//         <div className={styles.noScheduleMessage}>
//           <h2>Chưa xếp lịch thi đấu</h2>
//           <p>Lịch đấu sẽ được công bố sau khi giải đấu bắt đầu.</p>
//         </div>
//       );
//     }
    
//     const mockMatches = [
//       {
//         id: "match-001",
//         player1: "Kỳ Thủ An",
//         player2: "Kỳ Thủ Bình",
//         startTime: "10:00 25/07/2025", 
//         status: "Đã kết thúc",
//         score: "3-1"
//       },
//       {
//         id: "match-002",
//         player1: "Kỳ Thủ Cường",
//         player2: "Kỳ Thủ Dũng",
//         startTime: "14:30 30/07/2025",
//         status: "Đã kết thúc",
//         score: "2-0"
//       },
//       {
//         id: "match-003",
//         player1: "Kỳ Thủ Giang",
//         player2: "Kỳ Thủ Hải",
//         startTime: "09:00 01/08/2025", 
//         status: "Sắp diễn ra",
//         score: "Chưa đấu"
//       },
//       {
//         id: "match-004",
//         player1: "Kỳ Thủ Khoa",
//         player2: "Kỳ Thủ Long",
//         startTime: "11:00 05/08/2025", 
//         status: "Sắp diễn ra",
//         score: "Chưa đấu"
//       },
//       {
//         id: "match-005",
//         player1: "Kỳ Thủ Mai",
//         player2: "Kỳ Thủ Nam",
//         startTime: "16:00 10/08/2025", 
//         status: "Sắp diễn ra",
//         score: "Chưa đấu"
//       },
//       {
//         id: "match-006",
//         player1: "Kỳ Thủ Oanh",
//         player2: "Kỳ Thủ Phong",
//         startTime: "10:00 15/08/2025", // Sắp diễn ra
//         status: "Sắp diễn ra",
//         score: "Chưa đấu"
//       },
//     ];
//     return (
//       <div className={styles.matchList}>
//         {mockMatches.map(match => (
//           <Link
//           key={match.id}
//           to={`/tournament/${tournament_id}/matches/${match.id}`} 
//           className={styles.matchCardLink} 
//           >
//             <div className={styles.matchCard}>
//               <div className={styles.matchInfo}>
//                 <span>{match.player1}</span>
//                 <span>Vs</span>
//                 <span>{match.player2}</span>
//                 <span className={styles.matchTime}>TG Bắt Đầu: {match.startTime}</span>
//               </div>
//               <button
//                 className={styles.updateBtn}
//                 onClick={(e) => handleUpdateClick(e, match.id)}
//               >
//                 Cập nhật
//               </button>
//             </div>
//           </Link>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className={styles.pageWrapper}> 
//       {/* Banner */}
//       <div className={styles["banner"]}>
//         <img
//           src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
//           alt={tournament.title}
//         />
//       </div>

//       {/* Title and Info */}
//       <div className={styles["info-section"]}> 
//         <h1>{tournament.title}</h1>
//         <p>
//           {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
//         </p>
//         <p>{tournament.participants || 0} Participants</p>
//       </div>

//       {/* Tabs */}
//       <div className={styles["tabs"]}>
//         <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
//         <button className={styles.activeTab}>🎮 Các trận đấu</button>
//       </div>

//       {renderMatchList()}

//     </div>
//   );
// }

// export default TournamentDetailsMatch;


// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import styles from './TournamentDetail.module.css'; // Đảm bảo các style là chính xác

// function TournamentDetailsMatch() {
//     const { tournament_id } = useParams();
//     const navigate = useNavigate();

//     const [tournament, setTournament] = useState(null);
//     const [matches, setMatches] = useState([]);
//     const [players, setPlayers] = useState([]); // State để lưu danh sách người chơi để mapping ID ra tên
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Hàm để tìm tên người chơi từ ID
//     const getPlayerName = useCallback((playerId) => {
//         const player = players.find(p => p.id === playerId);
//         // Trả về tên hoặc "BYE" nếu đó là BYE_PLAYER, hoặc ID nếu không tìm thấy
//         if (playerId && playerId.startsWith('BYE_PLAYER_')) {
//             return 'BYE'; // Hiện thị "BYE" rõ ràng cho các trường hợp BYE
//         }
//         return player ? player.name_in_tournament : playerId; 
//     }, [players]);


//     // Hàm để fetch dữ liệu từ backend
//     const fetchData = useCallback(async () => {
//         const token = localStorage.getItem("jwtToken"); // Lấy token từ localStorage
//         const config = {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         };

//         try {
//             setLoading(true);
//             setError(null);

//             // Lấy thông tin tournament
//             const tournamentRes = await axios.get(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}`,
//                 config
//             );
//             setTournament(tournamentRes.data);

//             // Lấy danh sách người chơi để hiển thị tên
//             const playersRes = await axios.get(
//                 `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
//                 config
//             );
//             setPlayers(playersRes.data);

//             // Lấy danh sách trận đấu
//             const matchesRes = await axios.get(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`,
//                 config
//             );
//             // Sắp xếp các match theo ngày và round để hiển thị theo thứ tự
//             const sortedMatches = matchesRes.data.sort((a, b) => {
//                 const dateA = new Date(a.occurence_day);
//                 const dateB = new Date(b.occurence_day);
//                 if (dateA.getTime() !== dateB.getTime()) {
//                     return dateA.getTime() - dateB.getTime();
//                 }
//                 return a.round - b.round; // Sắp xếp theo vòng nếu cùng ngày
//             });
//             setMatches(sortedMatches);

//         } catch (err) {
//             console.error('Error fetching data:', err);
//             if (err.response && err.response.status === 401) {
//                 setError("Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
//             } else if (err.response && err.response.status === 404 && err.response.data.message && err.response.data.message.includes('No matches found')) {
//                 setMatches([]); // Nếu không có match, set rỗng thay vì lỗi
//                 setError(null);
//             }
//             else {
//                 setError("Không thể tải thông tin giải đấu hoặc danh sách trận đấu.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [tournament_id]); // Đã loại bỏ 'players' khỏi dependency array của fetchData

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]); // Gọi fetchData khi component mount hoặc fetchData thay đổi

//     if (loading) return <div className="loading">Đang tải...</div>;
//     if (error) return <div className="error">{error}</div>; // Hiển thị lỗi nếu có
//     if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

//     const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

//     const handleUpdateClick = (e, matchId) => {
//         e.stopPropagation(); // Ngăn sự kiện click lan truyền lên Link (nếu có)
//         e.preventDefault(); // Ngăn hành vi mặc định của Link
//         console.log("DEBUG: matchId received by handleUpdateClick:", matchId);
//         if (matchId) {
//           navigate(`/tournament/${tournament_id}/matches/${matchId}/edit`);
//       } else {
//           console.error("Match ID is undefined. Cannot navigate to edit page.");
//           window.alert("Không thể cập nhật trận đấu. ID trận đấu không hợp lệ.");
//       }
//     };

//     // Hàm render danh sách trận đấu hoặc thông báo
//     const renderMatchList = () => {
//         if (!hasTournamentStarted) {
//             return (
//                 <div className={styles.noScheduleMessage}>
//                     <h2>Chưa xếp lịch thi đấu</h2>
//                     <p>Lịch đấu sẽ được công bố sau khi giải đấu bắt đầu.</p>
//                 </div>
//             );
//         }

//         // Lọc chỉ những match có người chơi thật (loại bỏ placeholder và BYE thuần túy)
//         const scheduledMatches = matches.filter(match => match.players.length > 0);

//         if (scheduledMatches.length === 0) {
//             return (
//                 <div className={styles.noScheduleMessage}>
//                     <h2>Chưa có trận đấu nào được tạo hoặc xếp lịch</h2>
//                     <p>Vui lòng tạo bảng đấu để xem danh sách các trận đấu.</p>
//                 </div>
//             );
//         }

//         // Nhóm các trận đấu theo ngày
//         const matchesGroupedByDate = scheduledMatches.reduce((acc, match) => {
//             const date = new Date(match.occurence_day).toLocaleDateString('vi-VN'); // Định dạng ngày Việt Nam (chỉ ngày)
//             if (!acc[date]) {
//                 acc[date] = [];
//             }
//             // Sắp xếp các trận đấu trong cùng một ngày theo round và sau đó là ID để giữ thứ tự ổn định
//             acc[date].push(match);
//             acc[date].sort((a, b) => a.round - b.round || a.id.localeCompare(b.id)); 
//             return acc;
//         }, {});

//         const sortedDates = Object.keys(matchesGroupedByDate).sort((a, b) => {
//             // Chuyển đổi định dạng ngày dd/mm/yyyy sang mm/dd/yyyy để so sánh
//             const parseDate = (dateString) => {
//                 const [day, month, year] = dateString.split('/').map(Number);
//                 return new Date(year, month - 1, day);
//             };
//             return parseDate(a).getTime() - parseDate(b).getTime();
//         });


//         return (
//             <div className={styles.matchListContainer}>
//                 {sortedDates.map(date => (
//                     <div key={date} className={styles.dateGroup}>
//                         <h3 className={styles.dateHeader}>{date}</h3>
//                         <div className={styles.matchGroup}>
//                             {matchesGroupedByDate[date].map(match => (
//                                 <div key={match.id} className={styles.matchCard}>
//                                     <div className={styles.matchPlayersAndScores}>
//                                         {match.players.length > 0 && (
//                                             match.players.map((playerID, pIdx) => {
//                                                 const result = match.results.find(r => r.player === playerID);
//                                                 let scoreDisplay;

//                                                 if (match.status === 'pending') {
//                                                     // Nếu match đang chờ, hiển thị "chưa có điểm" in nghiêng
//                                                     scoreDisplay = <i style={{ fontStyle: 'italic' }}>chưa có điểm</i>;
//                                                 } else if (match.status === 'completed') {
//                                                     // Nếu match đã hoàn thành, hiển thị điểm thực tế
//                                                     scoreDisplay = result ? `${result.score}đ` : 'N/A';
//                                                 } else {
//                                                     // Các trạng thái khác (ongoing, etc.)
//                                                     scoreDisplay = result ? `${result.score}đ` : 'Chưa đấu';
//                                                 }
                                                
//                                                 return (
//                                                     <div key={pIdx} className={styles.playerEntry}>
//                                                         <span className={styles.playerName}>{getPlayerName(playerID)}</span>
//                                                         <span className={styles.playerScore}>{scoreDisplay}</span>
//                                                     </div>
//                                                 );
//                                             })
//                                         )}
//                                         {/* Thời gian của match */}
//                                         <div className={styles.matchTimeContainer}>
//                                             <span className={styles.matchTime}>
//                                                 Thời gian: {new Date(match.occurence_day).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
//                                             </span>
//                                         </div>
//                                     </div>
//                                     {/* Hiển thị trạng thái của match */}
//                                     {match.status === 'completed' && (
//                                          <div className={`${styles.matchStatusBadge} ${styles.completed}`}>Đã kết thúc</div>
//                                     )}
//                                     {match.status === 'pending' && (
//                                          <div className={`${styles.matchStatusBadge} ${styles.pending}`}>Sắp diễn ra</div>
//                                     )}
//                                     {/* Badge cho trận BYE đã hoàn thành */}
//                                     {match.status === 'completed' && match.players.length === 1 && (
//                                         <div className={`${styles.matchStatusBadge} ${styles.bye}`}>BYE</div>
//                                     )}
//                                     <button
//                                         className={styles.updateBtn}
//                                         onClick={(e) => handleUpdateClick(e, match.id)}
//                                     >
//                                         Cập nhật
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     return (
//       <div className={styles.pageWrapper}> 
//              {/* Banner */}
//              <div className={styles["banner"]}>
//                <img
//                  src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
//                  alt={tournament.title}
//                />
//              </div>
//                   {/* Title and Info */}
//              <div className={styles["info-section"]}> 
//                <h1>{tournament.title}</h1>
//                <p>
//                  {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
//                </p>
//                <p>{tournament.participants || 0} Participants</p>
//              </div>
//                   {/* Tabs */}
//              <div className={styles["tabs"]}>
//                <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
//                <button className={styles.activeTab}>🎮 Các trận đấu</button>
//              </div>
//                   {renderMatchList()}
//         </div>
//     );
//   }
// export default TournamentDetailsMatch;


import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css'; // Đảm bảo các style là chính xác



function TournamentDetailsMatch() {
    const { tournament_id } = useParams();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState([]); // State để lưu danh sách người chơi để mapping ID ra tên
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm để tìm tên người chơi từ ID
    const getPlayerName = useCallback((playerId) => {
        const player = players.find(p => p.id === playerId);
        // Trả về tên hoặc "BYE" nếu đó là BYE_PLAYER, hoặc ID nếu không tìm thấy
        if (playerId && playerId.startsWith('BYE_PLAYER_')) {
            return 'BYE'; // Hiện thị "BYE" rõ ràng cho các trường hợp BYE
        }
        return player ? player.name_in_tournament : playerId; 
    }, [players]);


    // Hàm để fetch dữ liệu từ backend
    const fetchData = useCallback(async () => {
        console.log("DEBUG: fetchData in TournamentDetailsMatch is called."); // Log khi fetchData bắt đầu
        const token = localStorage.getItem("jwtToken"); // Lấy token từ localStorage
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            setLoading(true);
            setError(null);

            // Lấy thông tin tournament
            const tournamentRes = await axios.get(
                `http://localhost:5000/api/admin/tournament/${tournament_id}`,
                config
            );
            setTournament(tournamentRes.data);
            console.log("DEBUG: Tournament data fetched:", tournamentRes.data);


            // Lấy danh sách người chơi để hiển thị tên
            const playersRes = await axios.get(
                `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
                config
            );
            setPlayers(playersRes.data);
            console.log("DEBUG: Players data fetched:", playersRes.data);


            // Lấy danh sách trận đấu
            const matchesRes = await axios.get(
                `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`,
                config
            );
            // Sắp xếp các match theo ngày và round để hiển thị theo thứ tự
            const sortedMatches = matchesRes.data.sort((a, b) => {
                const dateA = new Date(a.occurence_day);
                const dateB = new Date(b.occurence_day);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                }
                return a.round - b.round; // Sắp xếp theo vòng nếu cùng ngày
            });
            setMatches(sortedMatches);
            console.log("DEBUG: Matches data fetched:", sortedMatches);


        } catch (err) {
            console.error('Error fetching data in TournamentDetailsMatch:', err); // Log lỗi chi tiết hơn
            if (err.response && err.response.status === 404 && err.response.data.message && err.response.data.message.includes('No matches found')) {
                setMatches([]); // Nếu không có match, set rỗng để hiển thị thông báo "Chưa có trận đấu nào"
                setError(null); 
            } else if (err.response && err.response.status === 401) {
                setError("Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else {
                setError("Không thể tải thông tin giải đấu hoặc danh sách trận đấu. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }, [tournament_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi</div>;
    // Đảm bảo matchId được truyền vào là hợp lệ
    const handleUpdateClick = (e, matchId) => {
        e.stopPropagation(); // Ngăn sự kiện click lan truyền lên Link (nếu có)
        e.preventDefault(); // Ngăn hành vi mặc định của Link
        
        console.log("DEBUG: handleUpdateClick called for matchId:", matchId); // Log ngay khi hàm được gọi

        if (matchId) {
            console.log(`DEBUG: Navigating to /tournament/${tournament_id}/matches/${matchId}/edit`); // Log trước khi navigate
            navigate(`/tournament/${tournament_id}/matches/${matchId}/edit`);
        } else {
            console.error("Match ID is undefined. Cannot navigate to edit page.");
            window.alert("Không thể cập nhật trận đấu. ID trận đấu không hợp lệ.");
        }
    };
    
    const convertToValidDateObject = (dateString) => {
        // Nếu chuỗi rỗng, trả về null
        if (!dateString) return null;
        
        const parts = dateString.split('/');
        // Lấy ngày, tháng, năm từ chuỗi
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
        const year = parseInt(parts[2], 10);
        
        return new Date(year, month, day);
    };
        
    // Cập nhật lại logic kiểm tra ngày bắt đầu
    const tournamentStartDate = convertToValidDateObject(tournament.start_date);
    const hasTournamentStarted = tournamentStartDate && new Date() >= tournamentStartDate;
   
    // const hasTournamentStarted = tournament ? (new Date() >= new Date(tournament.start_date)) : false;


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

        // Lọc chỉ những match có người chơi thật (loại bỏ placeholder và BYE thuần túy)
        const scheduledMatches = matches.filter(match => match.players.length > 0);
        console.log("DEBUG: Filtered scheduledMatches:", scheduledMatches); // Log sau khi lọc

        if (scheduledMatches.length === 0) {
            return (
                <div className={styles.noScheduleMessage}>
                    <h2>Chưa có trận đấu nào được tạo hoặc xếp lịch</h2>
                    <p>Vui lòng tạo bảng đấu để xem danh sách các trận đấu.</p>
                </div>
            );
        }

        // Nhóm các trận đấu theo ngày
        const matchesGroupedByDate = scheduledMatches.reduce((acc, match) => {
            const date = new Date(match.occurence_day).toLocaleDateString('vi-VN'); 
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(match);
            acc[date].sort((a, b) => a.round - b.round || a.id.localeCompare(b.id)); 
            return acc;
        }, {});

        const sortedDates = Object.keys(matchesGroupedByDate).sort((a, b) => {
            const parseDate = (dateString) => {
                const [day, month, year] = dateString.split('/').map(Number);
                return new Date(year, month - 1, day);
            };
            return parseDate(a).getTime() - parseDate(b).getTime();
        });


        return (
            <div className={styles.matchListContainer}>
                {sortedDates.map(date => (
                    <div key={date} className={styles.dateGroup}>
                        <h3 className={styles.dateHeader}>{date}</h3>
                        <div className={styles.matchGroup}>
                            {matchesGroupedByDate[date].map(match => (
                                <div key={match.id} className={styles.matchCard}>
                                    <div className={styles.matchPlayersAndScores}>
                                        {match.players.length > 0 && (
                                            match.players.map((playerID, pIdx) => {
                                                const result = match.results.find(r => r.player === playerID);
                                                let scoreDisplay;

                                                if (match.status === 'pending') {
                                                    scoreDisplay = <i style={{ fontStyle: 'italic' }}>chưa có điểm</i>;
                                                } else if (match.status === 'completed') {
                                                    scoreDisplay = result ? `${result.score}đ` : 'N/A';
                                                } else {
                                                    scoreDisplay = result ? `${result.score}đ` : 'Chưa đấu';
                                                }
                                                
                                                return (
                                                    <div key={pIdx} className={styles.playerEntry}>
                                                        <span className={styles.playerName}>{getPlayerName(playerID)}</span>
                                                        <span className={styles.playerScore}>{scoreDisplay}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div className={styles.matchTimeContainer}>
                                            <span className={styles.matchTime}>
                                                Thời gian: {new Date(match.occurence_day).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    {match.status === 'completed' && (
                                         <div className={`${styles.matchStatusBadge} ${styles.completed}`}>Đã kết thúc</div>
                                    )}
                                    {match.status === 'pending' && (
                                         <div className={`${styles.matchStatusBadge} ${styles.pending}`}>Sắp diễn ra</div>
                                    )}
                                    {match.status === 'completed' && match.players.length === 1 && (
                                        <div className={`${styles.matchStatusBadge} ${styles.bye}`}>BYE</div>
                                    )}
                                    <button
                                        className={styles.updateBtn}
                                        onClick={(e) => {
                                            console.log("DEBUG: Button clicked, match.id:", match.id); // Log ngay khi nút được click
                                            handleUpdateClick(e, match.id);
                                        }}
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.pageWrapper}>
            {tournament && ( 
                <div className={styles["banner"]}>
                    <img
                        src={tournament?.image?.startsWith('http') ? tournament.image : `/${tournament?.image || 'images/default-banner.jpg'}`}
                        alt={tournament?.title || 'Tournament Banner'}
                    />
                </div>
            )}

            {tournament && (
                <div className={styles["info-section"]}>
                    <h1>{tournament.title}</h1>
                    <p>
                        {/* {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()} */}
                        {tournament.start_date} - {tournament.end_date}
                    </p>
                    <p>{tournament.participants || 0} Participants</p>
                </div>
            )}

            {tournament && (
                <div className={styles["tabs"]}>
                    <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
                    <button className={styles.activeTab}>🎮 Các trận đấu</button>
                </div>
            )}

            {renderMatchList()}

        </div>
    );
}

export default TournamentDetailsMatch;
