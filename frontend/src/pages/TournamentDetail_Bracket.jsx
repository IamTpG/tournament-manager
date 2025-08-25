// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import styles from './TournamentDetail.module.css';
// import './Bracket.css'
// function TournamentDetailBracket() {
//   const { tournament_id } = useParams();
//   const navigate = useNavigate();
//   const [tournament, setTournament] = useState(null);
//   const [players, setPlayers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Lấy token từ localStorage
//     const token = localStorage.getItem("jwtToken");

//     // Tạo một đối tượng headers để gửi kèm token
//     const config = {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     };

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         // Gọi API lấy thông tin giải đấu
//         const tournamentRes = await axios.get(
//           `http://localhost:5000/api/admin/tournament/${tournament_id}`,
//           config
//         );
//         setTournament(tournamentRes.data);

//         // Gọi API lấy danh sách người chơi (bắt buộc phải có token)
//         const playersRes = await axios.get(
//           `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
//           config
//         );
        
//         const playerNames = playersRes.data.map(p => p.name_in_tournament);
//         setPlayers(playerNames);
        
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         if (err.response && err.response.status === 401) {
//           setError("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
//         } else {
//           setError("Không thể tải thông tin giải đấu hoặc danh sách người chơi. Vui lòng thử lại.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [tournament_id, navigate]); 


//   if (loading) return <div className="loading">Đang tải...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

//   const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

//   const getNextPowerOfTwo = (n) => {
//     if (n === 0) return 0;
//     let power = 1;
//     while (power < n) {
//       power *= 2;
//     }
//     return power;
//   };

//   const createMatch = (tournamentId, format, players, occurenceDay) => {
//     return {
//       id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       tournament_ID: tournamentId,
//       format: format,
//       players: players,
//       results: players.map(player => ({ player: player, score: 0 })),
//       occurence_day: occurenceDay,
//     };
//   };

//   const generateBracketData = (participants, tournamentId, format, startDate, endDate) => {
//     if (!participants || participants.length === 0) return [];
  
//     const numActualParticipants = participants.length;
//     const nextPowerOfTwo = getNextPowerOfTwo(numActualParticipants);
//     const numByes = nextPowerOfTwo - numActualParticipants;
  
//     let currentPlayers = [...participants];
//     for (let i = 0; i < numByes; i++) {
//       currentPlayers.push('BYE');
//     }
//     for (let i = currentPlayers.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [currentPlayers[i], currentPlayers[j]] = [currentPlayers[j], currentPlayers[i]];
//     }
  
//     const rounds = [];
//     let roundIndex = 0;
  
//     const totalDaysAvailable = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
//     const numRounds = Math.log2(nextPowerOfTwo);
//     const daysPerRound = numRounds > 0 ? Math.floor(totalDaysAvailable / numRounds) : 0;
    
//     while (currentPlayers.length > 1 || roundIndex === 0) {
//       const roundMatches = [];
//       const nextRoundPlayers = [];
  
//       const currentRoundDate = new Date(startDate);
//       currentRoundDate.setDate(startDate.getDate() + (roundIndex * daysPerRound));
//       currentRoundDate.setHours(8, 0, 0, 0);
  
//       for (let i = 0; i < currentPlayers.length; i += 2) {
//         const player1 = currentPlayers[i];
//         const player2 = currentPlayers[i + 1] || null;
  
//         const match = createMatch(tournamentId, format, [player1, player2].filter(Boolean), currentRoundDate);
//         roundMatches.push(match);
  
//         if (player1 === 'BYE') {
//           nextRoundPlayers.push(player2);
//         } else if (player2 === 'BYE') {
//           nextRoundPlayers.push(player1);
//         } else if (player1 && player2) {
//           nextRoundPlayers.push(Math.random() < 0.5 ? player1 : player2);
//         } else if (player1) {
//           nextRoundPlayers.push(player1);
//         }
//       }
//       rounds.push(roundMatches);
//       currentPlayers = nextRoundPlayers;
//       roundIndex++;
      
//       if (currentPlayers.length <= 1) {
//         break;
//       }
//     }
//     return rounds;
//   };
  
//   const MATCH_HEIGHT = 70;
//   const getGapHeight = (roundIndex) => Math.pow(2, roundIndex) * (MATCH_HEIGHT + 10) - MATCH_HEIGHT;

//   const renderBracketOrRankingContent = () => {
//     if (!hasTournamentStarted) {
//       return (
//         <div className="no-schedule-message">
//           <h2>Giải đấu chưa bắt đầu</h2>
//           <p>Bảng đấu/xếp hạng sẽ được công bố sau khi giải đấu bắt đầu.</p>
//         </div>
//       );
//     }
  
//     switch (tournament.format) {
//       case "Loại trực tiếp":
//       case "Loại lần 2": {
//         const bracket = generateBracketData(
//           // Sử dụng danh sách người chơi đã fetch từ API
//           players,
//           tournament._id,
//           tournament.format,
//           new Date(tournament.start_date),
//           new Date(tournament.end_date)
//         );

//         const numRounds = bracket.length;
//         const roundNames = bracket.map((round, roundIndex) => {
//             const roundsLeft = numRounds - roundIndex;
//             if (roundsLeft === 1) {
//                 return "Chung kết";
//             } else if (roundsLeft === 2) {
//                 return "Bán kết";
//             } else if (roundsLeft === 3) {
//                 return "Tứ kết";
//             } else {
//                 return `Vòng ${roundIndex + 1}`;
//             }
//         });

//         return (
//           <div className="bracket-container-wrapper">
//             <div className="bracket-container">
//               {bracket.map((round, roundIndex) => (
//                 <div className="round" key={roundIndex}>
//                   <div className="round-title">
//                     {roundNames[roundIndex] || `Vòng ${roundIndex + 1}`}
//                   </div>
//                   {round.map((match, matchIndex) => (
//                     <div
//                       className="match"
//                       key={match.id}
//                       style={{
//                         marginBottom:
//                           matchIndex !== round.length - 1 ? `${getGapHeight(roundIndex)}px` : 0,
//                       }}
//                     >
//                       <div className="player-pair">
//                         {match.players.map((player, pIdx) => (
//                           <div key={pIdx} className="player">
//                             {player}
//                           </div>
//                         ))}
//                       </div>
//                       {roundIndex < bracket.length - 1 && (
//                         <>
//                           <div className="horizontal-line"></div>
//                           {matchIndex % 2 === 0 && matchIndex + 1 < round.length && (
//                             <>
//                               <div
//                                 className="vertical-line"
//                                 style={{ height: `${MATCH_HEIGHT + getGapHeight(roundIndex)}px` }}
//                               ></div>
//                               <div
//                                 className="horizontal-line-next"
//                                 style={{ top: `${getGapHeight(roundIndex) / 2 + MATCH_HEIGHT}px` }}
//                               ></div>
//                             </>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       }
  
//       case "Xếp hạng": {
//         // Tạo bảng xếp hạng dựa trên danh sách người chơi thật đã fetch
//         const rankings = players.map((name, index) => ({
//           id: `player-${index}`, // Cần một ID duy nhất
//           playerName: name,
//           score: Math.floor(Math.random() * 100) + 50,
//           wins: Math.floor(Math.random() * (players.length / 2)),
//           losses: Math.floor(Math.random() * (players.length / 2)),
//         })).sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

//         return (
//           <div className="ranking-container">
//             <h2>Bảng Xếp Hạng</h2>
//             <table className="ranking-table">
//               <thead>
//                 <tr className="table-header">
//                   <th className="table-cell">Hạng</th>
//                   <th className="table-cell">Kỳ Thủ</th>
//                   <th className="table-cell">Điểm</th>
//                   <th className="table-cell">Thắng</th>
//                   <th className="table-cell">Thua</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rankings.map((player) => (
//                   <tr key={player.id} className="table-row">
//                     <td className="table-cell">{player.rank}</td>
//                     <td className="table-cell">{player.playerName}</td>
//                     <td className="table-cell">{player.score}</td>
//                     <td className="table-cell">{player.wins}</td>
//                     <td className="table-cell">{player.losses}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       }
  
//       default:
//         return (
//           <div className="no-schedule-message">
//             <h2>Loại hình giải đấu không xác định hoặc chưa có bảng đấu/xếp hạng.</h2>
//             <p>Vui lòng kiểm tra lại loại hình giải đấu hoặc chờ cập nhật.</p>
//           </div>
//         );
//     }
//   };
//   return (
//     <div className={styles.pageWrapper}>
//         <div className={styles["banner"]}>
//           <img
//             src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
//             alt={tournament.title}
//           />
//         </div>

//         {/* Title and Info */}
//         <div className={styles["info-section"]}> 
//           <h1>{tournament.title}</h1>
//           <p>
//             {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
//           </p>
//           <p>{tournament.participants || 0} Participants</p>
//         </div>

      
//         <div className={styles["tabs"]}> 
//           <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
//           <button onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>🎮 Các trận đấu</button>
//         </div>
//         {renderBracketOrRankingContent()}
//     </div>
//   );
// }

// export default TournamentDetailBracket;


// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import styles from './TournamentDetail.module.css'; // Cho các style tổng thể trang
// import './Bracket.css'; // Cho các style của bracket và ranking table

// function TournamentDetailBracket() {
//     const { tournament_id } = useParams();
//     const navigate = useNavigate();
//     const [tournament, setTournament] = useState(null);
//     const [matches, setMatches] = useState([]); // Lưu trữ danh sách các match từ backend
//     const [players, setPlayers] = useState([]); // Lưu trữ danh sách người chơi để mapping ID ra tên
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Hàm để fetch dữ liệu từ backend
//     const fetchData = useCallback(async () => {
//         const token = localStorage.getItem("jwtToken");
//         const config = {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         };

//         try {
//             setLoading(true);
//             setError(null);

//             // Gọi API lấy thông tin giải đấu
//             const tournamentRes = await axios.get(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}`,
//                 config
//             );
//             setTournament(tournamentRes.data);

//             // Gọi API lấy danh sách người chơi (để hiển thị tên đầy đủ)
//             // Giả định endpoint này trả về danh sách player objects với 'id' và 'name_in_tournament'
//             const playersRes = await axios.get(
//                 `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
//                 config
//             );
//             setPlayers(playersRes.data);

//             // Gọi API lấy danh sách match đã tạo cho giải đấu
//             const matchesRes = await axios.get(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`,
//                 config
//             );
//             setMatches(matchesRes.data);

//         } catch (err) {
//             console.error("Failed to fetch data:", err);
//             if (err.response && err.response.status === 401) {
//                 setError("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
//             } else if (err.response && err.response.status === 404 && err.response.data.message && err.response.data.message.includes('No matches found')) {
//                 // Nếu chưa có match nào, không phải là lỗi, chỉ là chưa tạo
//                 setMatches([]);
//                 setError(null); // Xóa lỗi nếu chỉ là không tìm thấy match
//             } else {
//                 setError("Không thể tải thông tin giải đấu hoặc danh sách trận đấu. Vui lòng thử lại.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [tournament_id]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     // Hàm xử lý việc tạo bảng đấu (chỉ dành cho admin, tạo vòng 1)
//     const handleGenerateFirstRoundBracket = async () => {
//         const confirmGenerate = window.confirm("Bạn có chắc chắn muốn tạo bảng đấu vòng 1 cho giải này không? Thao tác này không thể hoàn tác nếu đã có match!");
//         if (!confirmGenerate) {
//             return;
//         }

//         const token = localStorage.getItem("jwtToken");
//         const config = {
//             headers: { 'Authorization': `Bearer ${token}` }
//         };

//         try {
//             await axios.post(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`, // Endpoint POST tạo match
//                 {}, // Body rỗng
//                 config
//             );
//             window.alert('Bảng đấu vòng 1 đã được tạo và lưu thành công!');
//             fetchData(); // Tải lại dữ liệu để hiển thị các match mới
//         } catch (err) {
//             console.error("Failed to generate first round bracket:", err);
//             if (err.response && err.response.status === 409) {
//                 window.alert(err.response.data.message || "Bảng đấu vòng 1 đã tồn tại cho giải đấu này.");
//             } else if (err.response && err.response.status === 400) {
//                  window.alert(err.response.data.message || "Không đủ người chơi hoặc không hỗ trợ loại hình/game này để tạo match.");
//             }
//             else {
//                 window.alert('Có lỗi xảy ra khi tạo bảng đấu vòng 1. Vui lòng thử lại.');
//             }
//         }
//     };

//     // Hàm xử lý việc tiến độ bảng đấu (tạo vòng tiếp theo)
//     const handleAdvanceBracket = async () => {
//         const confirmAdvance = window.confirm("Bạn có chắc chắn muốn tiến độ bảng đấu sang vòng tiếp theo không? Đảm bảo tất cả các trận đấu ở vòng hiện tại đã hoàn thành!");
//         if (!confirmAdvance) {
//             return;
//         }

//         const token = localStorage.getItem("jwtToken");
//         const config = {
//             headers: { 'Authorization': `Bearer ${token}` }
//         };

//         try {
//             await axios.post(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/advance-bracket`, // Endpoint POST mới
//                 {}, // Body rỗng
//                 config
//             );
//             window.alert('Bảng đấu đã được tiến độ thành công!');
//             fetchData(); // Tải lại dữ liệu để hiển thị vòng mới
//         } catch (err) {
//             console.error("Failed to advance bracket:", err);
//             window.alert(err.response?.data?.message || 'Có lỗi xảy ra khi tiến độ bảng đấu. Vui lòng kiểm tra lại các trận đấu đã hoàn thành.');
//         }
//     };

//     // Hàm để tìm tên người chơi từ ID
//     const getPlayerName = useCallback((playerId) => {
//         const player = players.find(p => p.id === playerId);
//         return player ? player.name_in_tournament : playerId; // Trả về tên hoặc ID nếu không tìm thấy
//     }, [players]);

//     if (loading) return <div className="loading">Đang tải...</div>;
//     if (error) return <div className="error">{error}</div>;
//     if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

//     const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

//     // Hằng số cho chiều cao match và khoảng cách để tính toán đường nối
//     const MATCH_HEIGHT = 70; // Chiều cao của một match box
//     const MATCH_MARGIN_BOTTOM = 30; // Margin bottom giữa các match box (áp dụng cho match cuối trong 1 cặp, hoặc match lẻ)

//     // Hàm tính toán khoảng trống ĐỘC LẬP cần thiết giữa các CẶP match
//     // Giá trị trả về này sẽ được dùng làm `margin-bottom` cho match đầu tiên trong một cặp.
//     // Khoảng cách này bao gồm height của match thứ 2 trong cặp + margin-bottom của nó + khoảng cách vertical của đường nối.
//     const getBracketLineSpacing = (roundIndex) => {
//         // Round 0 (Vòng 1, index 0): Space needed is `MATCH_HEIGHT + MATCH_MARGIN_BOTTOM` (100px)
//         // This is the vertical span from the top of one match to the top of the next match that pairs with it.
//         // The actual marginBottom will be this value minus MATCH_HEIGHT.
//         return (MATCH_HEIGHT + MATCH_MARGIN_BOTTOM) * Math.pow(2, roundIndex + 1);
//     };
    
//     // Dựng lại logic hiển thị bracket từ `matches` đã fetch
//     const renderBracketData = (fetchedMatches) => {
//         if (!fetchedMatches || fetchedMatches.length === 0) {
//             return (
//                 <div className="no-schedule-message">
//                     <h2>Chưa có bảng đấu</h2>
//                     <p>Bảng đấu sẽ được tạo và công bố sau khi giải đấu bắt đầu.</p>
//                     {hasTournamentStarted && (
//                         <button onClick={handleGenerateFirstRoundBracket} className="generate-bracket-btn">
//                             Tạo Bảng Đấu Vòng 1
//                         </button>
//                     )}
//                 </div>
//             );
//         }

//         // Nhóm các match theo vòng đấu và nhánh đấu
//         const roundsMap = new Map();
//         fetchedMatches.forEach(match => {
//             const roundKey = match.round;
//             const bracketType = match.bracket_type || 'winners'; 
            
//             const validBracketTypes = ['winners', 'losers', 'grand_finals'];
//             const finalBracketType = validBracketTypes.includes(bracketType) ? bracketType : 'winners';


//             if (!roundsMap.has(roundKey)) {
//                 roundsMap.set(roundKey, { winners: [], losers: [], grand_finals: [] });
//             }
//             roundsMap.get(roundKey)[finalBracketType].push(match);
//         });

//         // Sắp xếp các vòng đấu theo số thứ tự vòng
//         const sortedRoundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);
//         const bracket = sortedRoundNumbers.map(roundNum => {
//             const roundData = roundsMap.get(roundNum);
//             // Sắp xếp các match trong cùng một nhánh để hiển thị ổn định
//             const sortedWinnersMatches = roundData.winners.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
//             const sortedLosersMatches = roundData.losers.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
//             const sortedGrandFinalsMatches = roundData.grand_finals.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
//             return {
//                 roundNumber: roundNum,
//                 winners: sortedWinnersMatches,
//                 losers: sortedLosersMatches,
//                 grand_finals: sortedGrandFinalsMatches
//             };
//         });

//         // Hàm đặt tên vòng đấu
//         const getRoundName = (currentRoundNumber, bracketData) => {
//             const numMatchesInWinners = bracketData.winners.length;
//             const numMatchesInLosers = bracketData.losers.length;

//             if (bracketData.grand_finals.length > 0) {
//                 return "Chung kết tổng";
//             }
//             if (tournament.format === 'Loại trực tiếp') {
//                 if (numMatchesInWinners === 1) return "Chung kết";
//                 if (numMatchesInWinners === 2) return "Bán kết";
//                 if (numMatchesInWinners === 4) return "Tứ kết";
//             } else if (tournament.format === 'Loại lần 2') {
//                 // Tên vòng cụ thể cho Double Elimination
//                 // Ví dụ: Losers Round 1, Losers Round 2, Winners Semifinals, etc.
//                 if (numMatchesInWinners === 1 && numMatchesInLosers === 0) return "Chung kết nhánh thắng";
//                 if (numMatchesInWinners === 2) return "Bán kết nhánh thắng";
//                 if (numMatchesInWinners === 4) return "Tứ kết nhánh thắng";
//                 // Có thể bổ sung tên vòng cho nhánh thua nếu cần phân biệt rõ hơn
//             }
            
//             return `Vòng ${currentRoundNumber}`;
//         };

//         // Xác định vòng đấu cao nhất đã hoàn thành để biết có thể advance hay không
//         const maxCompletedRoundNumber = fetchedMatches.reduce((max, match) => 
//             match.status === 'completed' ? Math.max(max, match.round) : max, 0
//         );
//         const lastRoundData = bracket[bracket.length - 1];
//         const canAdvance = tournament.format === 'Loại lần 2' && 
//                            lastRoundData && 
//                            lastRoundData.roundNumber === maxCompletedRoundNumber && // Đảm bảo tất cả các match trong vòng cao nhất đã hoàn thành
//                            lastRoundData.winners.every(m => m.status === 'completed') &&
//                            lastRoundData.losers.every(m => m.status === 'completed') &&
//                            lastRoundData.grand_finals.every(m => m.status === 'completed') &&
//                            (lastRoundData.winners.length > 1 || lastRoundData.losers.length > 1 || 
//                             (lastRoundData.winners.length === 1 && lastRoundData.losers.length === 1 && lastRoundData.grand_finals.length === 0)); // Not final match yet or grand finals not created

//         // Kiểm tra nếu giải đấu đã kết thúc
//         let isTournamentCompleted = false;
//         let winnerOfTournament = null;

//         if (tournament.format === 'Loại trực tiếp' && lastRoundData && lastRoundData.winners.length === 1 && lastRoundData.winners[0].status === 'completed') {
//              isTournamentCompleted = true;
//              winnerOfTournament = lastRoundData.winners[0].results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player;
//         } else if (tournament.format === 'Loại lần 2' && lastRoundData && lastRoundData.grand_finals.length === 1 && lastRoundData.grand_finals[0].status === 'completed') {
//              isTournamentCompleted = true;
//              winnerOfTournament = lastRoundData.grand_finals[0].results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player;
//         }

//         return (
//             <div className="bracket-page"> {/* Wrapper chính cho bracket */}
//                 <div className="bracket-controls">
//                     {/* Nút tiến độ vòng tiếp theo */}
//                     {!isTournamentCompleted && hasTournamentStarted && canAdvance &&
//                         (tournament.format === 'Loại trực tiếp' || tournament.format === 'Loại lần 2') && (
//                         <button onClick={handleAdvanceBracket} className="advance-bracket-btn">
//                             Tiến độ Vòng Tiếp Theo
//                         </button>
//                     )}
//                     {isTournamentCompleted && (
//                          <div className="tournament-complete-message">
//                             Giải đấu đã kết thúc! Nhà vô địch: **{getPlayerName(winnerOfTournament)}**
//                         </div>
//                     )}
//                 </div>

//                 <div className="bracket-container">
//                     {bracket.map((roundData, roundIndex) => (
//                         <div className="round" key={roundIndex}>
//                             <div className="round-title">
//                                 {getRoundName(roundData.roundNumber, roundData)} {/* Sử dụng hàm getRoundName */}
//                             </div>
                            
//                             {/* Hiển thị Nhánh Thắng (Winners' Bracket) */}
//                             {roundData.winners.length > 0 && (
//                                 <div className="bracket-segment winners-bracket">
//                                     <h4 className="bracket-segment-title">Nhánh thắng</h4>
//                                     {roundData.winners.map((match, matchIndex) => {
//                                         const isFirstMatchInPair = matchIndex % 2 === 0;
//                                         const hasNextMatchInPair = matchIndex + 1 < roundData.winners.length;
//                                         const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

//                                         return (
//                                             <div
//                                                 className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
//                                                 key={match.id}
//                                                 style={{
//                                                     // Chỉ áp dụng margin-bottom lớn cho match đầu tiên của cặp
//                                                     marginBottom: showConnectors ? `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px` : `${MATCH_MARGIN_BOTTOM}px`,
//                                                     // Nếu là match cuối cùng trong segment, không có margin-bottom
//                                                     ...(matchIndex === roundData.winners.length - 1 && { marginBottom: 0 }),
//                                                 }}
//                                             >
//                                                 <div className="match-info">
//                                                     <span className="match-status">({match.status})</span>
//                                                     <span className="match-day">
//                                                         {new Date(match.occurence_day).toLocaleDateString()}
//                                                     </span>
//                                                 </div>
//                                                 <div className="player-pair">
//                                                     {match.players.map((playerID, pIdx) => (
//                                                         <div key={pIdx} className="player">
//                                                             {/* KHÔNG hiển thị gì nếu match pending, hiện tên nếu completed */}
//                                                             {match.status === 'pending' ? '' : getPlayerName(playerID)}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                                 {match.status === 'completed' && match.players.length === 2 && (
//                                                     <div className="match-scores">
//                                                         {match.results.map((res, resIdx) => (
//                                                             <span key={resIdx}>
//                                                                 {getPlayerName(res.player)}: {res.score}
//                                                                 {/* Kiểm tra người thắng và thêm (W) */}
//                                                                 {match.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player === res.player && " (W)"}
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                                 {/* Logic vẽ đường nối */}
//                                                 {roundIndex < bracket.length -1 && (
//                                                     <>
//                                                         <div className="horizontal-line"></div> {/* Luôn có đường ngang ra khỏi match */}
//                                                         {showConnectors && ( // Chỉ vẽ vertical và horizontal-next cho match đầu tiên của cặp
//                                                             <>
//                                                                 <div 
//                                                                     className="vertical-line"
//                                                                     style={{ 
//                                                                         // Chiều cao đường dọc: Từ giữa match này đến giữa match kế tiếp trong cặp
//                                                                         height: `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px`,
//                                                                         top: `${MATCH_HEIGHT / 2}px` // Bắt đầu từ giữa match hiện tại
//                                                                     }}
//                                                                 ></div>
//                                                                 <div 
//                                                                     className="horizontal-line-next"
//                                                                     style={{ 
//                                                                         // Đặt ở giữa đường dọc
//                                                                         top: `${MATCH_HEIGHT / 2 + (getBracketLineSpacing(roundIndex) - MATCH_HEIGHT) / 2}px`
//                                                                     }}
//                                                                 ></div>
//                                                             </>
//                                                         )}
//                                                     </>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             )}

//                             {/* Hiển thị Nhánh Thua (Losers' Bracket) - chỉ cho Loại lần 2 */}
//                             {tournament.format === 'Loại lần 2' && roundData.losers.length > 0 && (
//                                 <div className="bracket-segment losers-bracket">
//                                     <h4 className="bracket-segment-title">Nhánh thua</h4>
//                                     {roundData.losers.map((match, matchIndex) => {
//                                         const isFirstMatchInPair = matchIndex % 2 === 0;
//                                         const hasNextMatchInPair = matchIndex + 1 < roundData.losers.length;
//                                         const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

//                                         return (
//                                             <div
//                                                 className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
//                                                 key={match.id}
//                                                 style={{
//                                                     marginBottom: showConnectors ? `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px` : `${MATCH_MARGIN_BOTTOM}px`,
//                                                     ...(matchIndex === roundData.losers.length - 1 && { marginBottom: 0 }),
//                                                 }}
//                                             >
//                                                 <div className="match-info">
//                                                     <span className="match-status">({match.status})</span>
//                                                     <span className="match-day">
//                                                         {new Date(match.occurence_day).toLocaleDateString()}
//                                                     </span>
//                                                 </div>
//                                                 <div className="player-pair">
//                                                     {match.players.map((playerID, pIdx) => (
//                                                         <div key={pIdx} className="player">
//                                                             {/* KHÔNG hiển thị gì nếu match pending, hiện tên nếu completed */}
//                                                             {match.status === 'pending' ? '' : getPlayerName(playerID)}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                                 {match.status === 'completed' && match.players.length === 2 && (
//                                                     <div className="match-scores">
//                                                         {match.results.map((res, resIdx) => (
//                                                             <span key={resIdx}>
//                                                                 {getPlayerName(res.player)}: {res.score}
//                                                                 {match.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player === res.player && " (W)"}
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                                 {/* Logic vẽ đường nối cho nhánh thua (tương tự nhánh thắng) */}
//                                                 {roundIndex < bracket.length -1 && (
//                                                     <>
//                                                         <div className="horizontal-line"></div>
//                                                         {showConnectors && (
//                                                             <>
//                                                                 <div 
//                                                                     className="vertical-line"
//                                                                     style={{ 
//                                                                         height: `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px`,
//                                                                         top: `${MATCH_HEIGHT / 2}px`
//                                                                     }}
//                                                                 ></div>
//                                                                 <div 
//                                                                     className="horizontal-line-next"
//                                                                     style={{ 
//                                                                         top: `${MATCH_HEIGHT / 2 + (getBracketLineSpacing(roundIndex) - MATCH_HEIGHT) / 2}px`
//                                                                     }}
//                                                                 ></div>
//                                                             </>
//                                                         )}
//                                                     </>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             )}

//                             {/* Hiển thị Chung kết tổng (Grand Finals) */}
//                             {roundData.grand_finals.length > 0 && (
//                                 <div className="bracket-segment grand-finals-bracket">
//                                     <h4 className="bracket-segment-title">Chung kết tổng</h4>
//                                     {roundData.grand_finals.map((match) => (
//                                         <div
//                                             className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
//                                             key={match.id}
//                                         >
//                                             <div className="match-info">
//                                                 <span className="match-status">({match.status})</span>
//                                                 <span className="match-day">
//                                                     {new Date(match.occurence_day).toLocaleDateString()}
//                                                 </span>
//                                             </div>
//                                             <div className="player-pair">
//                                                 {match.players.map((playerID, pIdx) => (
//                                                     <div key={pIdx} className="player">
//                                                         {/* KHÔNG hiển thị gì nếu match pending, hiện tên nếu completed */}
//                                                         {match.status === 'pending' ? '' : getPlayerName(playerID)}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                             {match.status === 'completed' && match.players.length === 2 && (
//                                                 <div className="match-scores">
//                                                     {match.results.map((res, resIdx) => (
//                                                         <span key={resIdx}>
//                                                             {getPlayerName(res.player)}: {res.score}
//                                                             {/* Kiểm tra người thắng và thêm (W) */}
//                                                             {match.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player === res.player && " (W)"}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     };

//     const renderRankingContent = () => {
//         // Đối với thể thức "Xếp hạng", bạn sẽ cần hiển thị bảng xếp hạng.
//         // Dữ liệu 'players' đã được fetch và có thể được dùng.
//         // Cập nhật: Lấy điểm số từ match format "Xếp hạng" nếu có.
//         const rankingMatch = matches.find(m => m.format === 'Xếp hạng');
//         const playerScoresMap = new Map();
//         if (rankingMatch) {
//             rankingMatch.results.forEach(res => {
//                 playerScoresMap.set(res.player, res.score);
//             });
//         }

//         const playerNamesWithScores = players.map(p => ({
//             id: p.id,
//             playerName: p.name_in_tournament,
//             score: playerScoresMap.get(p.id) || 0, // Lấy điểm thực tế hoặc 0
//         })).sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

//         return (
//             <div className="ranking-container">
//                 <h2>Bảng Xếp Hạng</h2>
//                 <table className="ranking-table">
//                     <thead>
//                         <tr className="table-header">
//                             <th className="table-cell">Hạng</th>
//                             <th className="table-cell">Kỳ Thủ</th>
//                             <th className="table-cell">Điểm</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {playerNamesWithScores.map((player) => (
//                             <tr key={player.id} className="table-row">
//                                 <td className="table-cell">{player.rank}</td>
//                                 <td className="table-cell">{player.playerName}</td>
//                                 <td className="table-cell">{player.score}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     };

//     const renderContentBasedOnFormat = () => {
//         if (!hasTournamentStarted) {
//             return (
//                 <div className="no-schedule-message">
//                     <h2>Giải đấu chưa bắt đầu</h2>
//                     <p>Bảng đấu/xếp hạng sẽ được công bố sau khi giải đấu bắt đầu.</p>
//                 </div>
//             );
//         }

//         switch (tournament.format) {
//             case "Loại trực tiếp":
//             case "Loại lần 2":
//                 return renderBracketData(matches); 
//             case "Xếp hạng":
//                 return renderRankingContent(); 
//             case "TFT": 
//                 return renderBracketData(matches);
//             default:
//                 return (
//                     <div className="no-schedule-message">
//                         <h2>Loại hình giải đấu không xác định hoặc chưa có bảng đấu/xếp hạng.</h2>
//                         <p>Vui lòng kiểm tra lại loại hình giải đấu hoặc chờ cập nhật.</p>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className={styles.pageWrapper}>
//             <div className={styles["banner"]}>
//                 <img
//                     src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
//                     alt={tournament.title}
//                 />
//             </div>

//             <div className={styles["info-section"]}>
//                 <h1>{tournament.title}</h1>
//                 <p>
//                     {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
//                 </p>
//                 <p>{tournament.participants || 0} Participants</p>
//             </div>

//             <div className={styles["tabs"]}>
//                 <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
//                 <button onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>🎮 Các trận đấu</button>
//             </div>
//             {renderContentBasedOnFormat()}
//         </div>
//     );
// }

// export default TournamentDetailBracket;










// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import styles from './TournamentDetail.module.css'; // Cho các style tổng thể trang
// import './Bracket.css'; // Cho các style của bracket và ranking table

// function TournamentDetailBracket() {
//     const { tournament_id } = useParams();
//     const navigate = useNavigate();
//     const [tournament, setTournament] = useState(null);
//     const [matches, setMatches] = useState([]); // Lưu trữ danh sách các match từ backend
//     const [players, setPlayers] = useState([]); // Lưu trữ danh sách người chơi để mapping ID ra tên
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Hàm để fetch dữ liệu từ backend
//     const fetchData = useCallback(async () => {
//         const token = localStorage.getItem("jwtToken");
//         const config = {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         };

//         try {
//             setLoading(true);
//             setError(null);

//             // Gọi API lấy thông tin giải đấu
//             const tournamentRes = await axios.get(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}`,
//                 config
//             );
//             setTournament(tournamentRes.data);

//             // Gọi API lấy danh sách người chơi (để hiển thị tên đầy đủ)
//             // Giả định endpoint này trả về danh sách player objects với 'id' và 'name_in_tournament'
//             const playersRes = await axios.get(
//                 `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
//                 config
//             );
//             setPlayers(playersRes.data);

//             // Gọi API lấy danh sách match đã tạo cho giải đấu
//             const matchesRes = await axios.get(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`,
//                 config
//             );
//             setMatches(matchesRes.data);

//         } catch (err) {
//             console.error("Failed to fetch data:", err);
//             if (err.response && err.response.status === 401) {
//                 setError("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
//             } else if (err.response && err.response.status === 404 && err.response.data.message && err.response.data.message.includes('No matches found')) {
//                 // Nếu chưa có match nào, không phải là lỗi, chỉ là chưa tạo
//                 setMatches([]);
//                 setError(null); // Xóa lỗi nếu chỉ là không tìm thấy match
//             } else {
//                 setError("Không thể tải thông tin giải đấu hoặc danh sách trận đấu. Vui lòng thử lại.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [tournament_id]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     // Hàm xử lý việc tạo bảng đấu (chỉ dành cho admin, tạo vòng 1)
//     const handleGenerateFirstRoundBracket = async () => {
//         const confirmGenerate = window.confirm("Bạn có chắc chắn muốn tạo bảng đấu cho giải này không? Thao tác này sẽ tạo toàn bộ cấu trúc bracket và không thể hoàn tác nếu đã có match!");
//         if (!confirmGenerate) {
//             return;
//         }

//         const token = localStorage.getItem("jwtToken");
//         const config = {
//             headers: { 'Authorization': `Bearer ${token}` }
//         };

//         try {
//             await axios.post(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`, // Endpoint POST tạo match
//                 {}, // Body rỗng
//                 config
//             );
//             window.alert('Cấu trúc bảng đấu đã được tạo và lưu thành công!');
//             fetchData(); // Tải lại dữ liệu để hiển thị các match mới
//         } catch (err) {
//             console.error("Failed to generate first round bracket:", err);
//             if (err.response && err.response.status === 409) {
//                 window.alert(err.response.data.message || "Bảng đấu đã tồn tại cho giải đấu này. Vui lòng xóa để tạo lại.");
//             } else if (err.response && err.response.status === 400) {
//                  window.alert(err.response.data.message || "Không đủ người chơi hoặc không hỗ trợ loại hình/game này để tạo match.");
//             }
//             else {
//                 window.alert('Có lỗi xảy ra khi tạo bảng đấu. Vui lòng thử lại.');
//             }
//         }
//     };

//     // Hàm xử lý việc tiến độ bảng đấu (tạo vòng tiếp theo)
//     const handleAdvanceBracket = async () => {
//         const confirmAdvance = window.confirm("Bạn có chắc chắn muốn tiến độ bảng đấu sang vòng tiếp theo không? Đảm bảo tất cả các trận đấu ở vòng hiện tại đã hoàn thành!");
//         if (!confirmAdvance) {
//             return;
//         }

//         const token = localStorage.getItem("jwtToken");
//         const config = {
//             headers: { 'Authorization': `Bearer ${token}` }
//         };

//         try {
//             await axios.post(
//                 `http://localhost:5000/api/admin/tournament/${tournament_id}/advance-bracket`, // Endpoint POST mới
//                 {}, // Body rỗng
//                 config
//             );
//             window.alert('Bảng đấu đã được tiến độ thành công!');
//             fetchData(); // Tải lại dữ liệu để hiển thị vòng mới
//         } catch (err) {
//             console.error("Failed to advance bracket:", err);
//             window.alert(err.response?.data?.message || 'Có lỗi xảy ra khi tiến độ bảng đấu. Vui lòng kiểm tra lại các trận đấu đã hoàn thành.');
//         }
//     };

//     // Hàm để tìm tên người chơi từ ID
//     const getPlayerName = useCallback((playerId) => {
//         const player = players.find(p => p.id === playerId);
//         return player ? player.name_in_tournament : playerId; // Trả về tên hoặc ID nếu không tìm thấy
//     }, [players]);

//     if (loading) return <div className="loading">Đang tải...</div>;
//     if (error) return <div className="error">{error}</div>;
//     if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

//     const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

//     // Hằng số cho chiều cao match và khoảng cách để tính toán đường nối
//     const MATCH_HEIGHT = 70; // Chiều cao của một match box
//     const MATCH_MARGIN_BOTTOM = 30; // Margin bottom giữa các match box (áp dụng cho match cuối trong 1 cặp, hoặc match lẻ)

//     // Hàm tính toán khoảng trống ĐỘC LẬP cần thiết giữa các CẶP match
//     // Giá trị trả về này sẽ được dùng làm `margin-bottom` cho match đầu tiên trong một cặp.
//     // Khoảng cách này bao gồm height của match thứ 2 trong cặp + margin-bottom của nó + khoảng cách vertical của đường nối.
//     const getBracketLineSpacing = (roundIndex) => {
//         // Round 0 (Vòng 1, index 0): Space needed is `MATCH_HEIGHT + MATCH_MARGIN_BOTTOM` (100px)
//         // This is the vertical span from the top of one match to the top of the next match that pairs with it.
//         // The actual marginBottom will be this value minus MATCH_HEIGHT.
//         return (MATCH_HEIGHT + MATCH_MARGIN_BOTTOM) * Math.pow(2, roundIndex + 1);
//     };
    
//     // Dựng lại logic hiển thị bracket từ `matches` đã fetch
//     const renderBracketData = (fetchedMatches) => {
//         if (!fetchedMatches || fetchedMatches.length === 0) {
//             return (
//                 <div className="no-schedule-message">
//                     <h2>Chưa có bảng đấu</h2>
//                     <p>Bảng đấu sẽ được tạo và công bố sau khi giải đấu bắt đầu.</p>
//                     {hasTournamentStarted && (
//                         <button onClick={handleGenerateFirstRoundBracket} className="generate-bracket-btn">
//                             Tạo Bảng Đấu
//                         </button>
//                     )}
//                 </div>
//             );
//         }

//         // Nhóm các match theo vòng đấu và nhánh đấu
//         const roundsMap = new Map();
//         fetchedMatches.forEach(match => {
//             const roundKey = match.round;
//             const bracketType = match.bracket_type || 'winners'; 
            
//             const validBracketTypes = ['winners', 'losers', 'grand_finals'];
//             const finalBracketType = validBracketTypes.includes(bracketType) ? bracketType : 'winners';


//             if (!roundsMap.has(roundKey)) {
//                 roundsMap.set(roundKey, { winners: [], losers: [], grand_finals: [] });
//             }
//             roundsMap.get(roundKey)[finalBracketType].push(match);
//         });

//         // Sắp xếp các vòng đấu theo số thứ tự vòng
//         const sortedRoundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);
//         const bracket = sortedRoundNumbers.map(roundNum => {
//             const roundData = roundsMap.get(roundNum);
//             // Sắp xếp các match trong cùng một nhánh để hiển thị ổn định
//             const sortedWinnersMatches = roundData.winners.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
//             const sortedLosersMatches = roundData.losers.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
//             const sortedGrandFinalsMatches = roundData.grand_finals.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
//             return {
//                 roundNumber: roundNum,
//                 winners: sortedWinnersMatches,
//                 losers: sortedLosersMatches,
//                 grand_finals: sortedGrandFinalsMatches
//             };
//         });

//         // Hàm đặt tên vòng đấu
//         const getRoundName = (currentRoundNumber, bracketData) => {
//             const numMatchesInWinners = bracketData.winners.length;
//             const numMatchesInLosers = bracketData.losers.length;

//             if (bracketData.grand_finals.length > 0) {
//                 return "Chung kết tổng";
//             }
//             if (tournament.format === 'Loại trực tiếp') {
//                 if (numMatchesInWinners === 1) return "Chung kết";
//                 if (numMatchesInWinners === 2) return "Bán kết";
//                 if (numMatchesInWinners === 4) return "Tứ kết";
//                 // Nếu không phải các vòng đặc biệt, dùng tên Vòng X
//                 return `Vòng ${currentRoundNumber}`; 
//             } else if (tournament.format === 'Loại lần 2') {
//                 // Tên vòng cụ thể cho Double Elimination
//                 // Ví dụ: Losers Round 1, Losers Round 2, Winners Semifinals, etc.
//                 if (numMatchesInWinners === 1 && numMatchesInLosers === 0) return "Chung kết nhánh thắng";
//                 if (numMatchesInWinners === 2) return "Bán kết nhánh thắng";
//                 if (numMatchesInWinners === 4) return "Tứ kết nhánh thắng";
//                 // Có thể bổ sung tên vòng cho nhánh thua nếu cần phân biệt rõ hơn
//             }
            
//             return `Vòng ${currentRoundNumber}`;
//         };

//         // Xác định vòng đấu cao nhất đã hoàn thành để biết có thể advance hay không
//         const maxCompletedRoundNumber = fetchedMatches.reduce((max, match) => 
//             match.status === 'completed' ? Math.max(max, match.round) : max, 0
//         );
//         const lastRoundData = bracket[bracket.length - 1];
//         const canAdvance = tournament.format === 'Loại lần 2' && 
//                            lastRoundData && 
//                            lastRoundData.roundNumber === maxCompletedRoundNumber && // Đảm bảo tất cả các match trong vòng cao nhất đã hoàn thành
//                            lastRoundData.winners.every(m => m.status === 'completed') &&
//                            lastRoundData.losers.every(m => m.status === 'completed') &&
//                            lastRoundData.grand_finals.every(m => m.status === 'completed') &&
//                            (lastRoundData.winners.length > 1 || lastRoundData.losers.length > 1 || 
//                             (lastRoundData.winners.length === 1 && lastRoundData.losers.length === 1 && lastRoundData.grand_finals.length === 0)); // Not final match yet or grand finals not created

//         // Kiểm tra nếu giải đấu đã kết thúc
//         let isTournamentCompleted = false;
//         let winnerOfTournament = null;

//         if (tournament.format === 'Loại trực tiếp' && lastRoundData && lastRoundData.winners.length === 1 && lastRoundData.winners[0].status === 'completed') {
//              isTournamentCompleted = true;
//              winnerOfTournament = lastRoundData.winners[0].results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player;
//         } else if (tournament.format === 'Loại lần 2' && lastRoundData && lastRoundData.grand_finals.length === 1 && lastRoundData.grand_finals[0].status === 'completed') {
//              isTournamentCompleted = true;
//              winnerOfTournament = lastRoundData.grand_finals[0].results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player;
//         }

//         return (
//             <div className="bracket-page"> {/* Wrapper chính cho bracket */}
//                 <div className="bracket-controls">
//                     {/* Nút tiến độ vòng tiếp theo */}
//                     {!isTournamentCompleted && hasTournamentStarted && canAdvance &&
//                         (tournament.format === 'Loại trực tiếp' || tournament.format === 'Loại lần 2') && (
//                         <button onClick={handleAdvanceBracket} className="advance-bracket-btn">
//                             Tiến độ Vòng Tiếp Theo
//                         </button>
//                     )}
//                     {isTournamentCompleted && (
//                          <div className="tournament-complete-message">
//                             Giải đấu đã kết thúc! Nhà vô địch: **{getPlayerName(winnerOfTournament)}**
//                         </div>
//                     )}
//                 </div>

//                 <div className="bracket-container">
//                     {bracket.map((roundData, roundIndex) => (
//                         <div className="round" key={roundIndex}>
//                             <div className="round-title">
//                                 {getRoundName(roundData.roundNumber, roundData)} {/* Sử dụng hàm getRoundName */}
//                             </div>
                            
//                             {/* Hiển thị Nhánh Thắng (Winners' Bracket) */}
//                             {roundData.winners.length > 0 && (
//                                 <div className="bracket-segment winners-bracket">
//                                     {tournament.format === 'Loại lần 2' && <h4 className="bracket-segment-title">Nhánh thắng</h4>}
//                                     {roundData.winners.map((match, matchIndex) => {
//                                         const isFirstMatchInPair = matchIndex % 2 === 0;
//                                         const hasNextMatchInPair = matchIndex + 1 < roundData.winners.length;
//                                         const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

//                                         // Xác định người thắng để in đậm
//                                         let winnerId = null;
//                                         if (match.status === 'completed' && match.players.length === 2 && match.results && match.results.length === 2) {
//                                             const player1Result = match.results.find(r => r.player === match.players[0]);
//                                             const player2Result = match.results.find(r => r.player === match.players[1]);
//                                             if (player1Result && player2Result) {
//                                                 winnerId = (player1Result.score > player2Result.score) ? player1Result.player : player2Result.player;
//                                             }
//                                         }

//                                         return (
//                                             <div
//                                                 className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
//                                                 key={match.id}
//                                                 style={{
//                                                     // Chỉ áp dụng margin-bottom lớn cho match đầu tiên của cặp
//                                                     marginBottom: showConnectors ? `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px` : `${MATCH_MARGIN_BOTTOM}px`,
//                                                     // Nếu là match cuối cùng trong segment, không có margin-bottom
//                                                     ...(matchIndex === roundData.winners.length - 1 && { marginBottom: 0 }),
//                                                 }}
//                                             >
//                                                 {/* Đã loại bỏ div match-info */}
//                                                 <div className="player-pair">
//                                                     {match.players.length > 0 ? ( // Chỉ render player nếu có player
//                                                         match.players.map((playerID, pIdx) => (
//                                                             <div 
//                                                                 key={pIdx} 
//                                                                 className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
//                                                             >
//                                                                 {/* LUÔN hiển thị tên người chơi (hoặc ID nếu không tìm thấy tên) */}
//                                                                 {getPlayerName(playerID)}
//                                                             </div>
//                                                         ))
//                                                     ) : (
//                                                         // Render 2 div trống nếu không có player (cho match placeholder)
//                                                         <>
//                                                             <div className="player empty-player"></div>
//                                                             <div className="player empty-player"></div>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                                 {match.status === 'completed' && match.players.length === 2 && (
//                                                     <div className="match-scores">
//                                                         {match.results.map((res, resIdx) => (
//                                                             <span key={resIdx}>
//                                                                 {getPlayerName(res.player)}: {res.score}
//                                                                 {/* Kiểm tra người thắng và thêm (W) */}
//                                                                 {match.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player === res.player && " (W)"}
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                                 {/* Logic vẽ đường nối */}
//                                                 {roundIndex < bracket.length -1 && (
//                                                     <>
//                                                         <div className="horizontal-line"></div> {/* Luôn có đường ngang ra khỏi match */}
//                                                         {showConnectors && ( // Chỉ vẽ vertical và horizontal-next cho match đầu tiên của cặp
//                                                             <>
//                                                                 <div 
//                                                                     className="vertical-line"
//                                                                     style={{ 
//                                                                         // Chiều cao đường dọc: Từ giữa match này đến giữa match kế tiếp trong cặp
//                                                                         height: `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px`,
//                                                                         top: `${MATCH_HEIGHT / 2}px` // Bắt đầu từ giữa match hiện tại
//                                                                     }}
//                                                                 ></div>
//                                                                 <div 
//                                                                     className="horizontal-line-next"
//                                                                     style={{ 
//                                                                         // Đặt ở giữa đường dọc
//                                                                         top: `${MATCH_HEIGHT / 2 + (getBracketLineSpacing(roundIndex) - MATCH_HEIGHT) / 2}px`
//                                                                     }}
//                                                                 ></div>
//                                                             </>
//                                                         )}
//                                                     </>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             )}

//                             {/* Hiển thị Nhánh Thua (Losers' Bracket) - chỉ cho Loại lần 2 */}
//                             {tournament.format === 'Loại lần 2' && roundData.losers.length > 0 && (
//                                 <div className="bracket-segment losers-bracket">
//                                     <h4 className="bracket-segment-title">Nhánh thua</h4>
//                                     {roundData.losers.map((match, matchIndex) => {
//                                         const isFirstMatchInPair = matchIndex % 2 === 0;
//                                         const hasNextMatchInPair = matchIndex + 1 < roundData.losers.length;
//                                         const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

//                                         // Xác định người thắng để in đậm
//                                         let winnerId = null;
//                                         if (match.status === 'completed' && match.players.length === 2 && match.results && match.results.length === 2) {
//                                             const player1Result = match.results.find(r => r.player === match.players[0]);
//                                             const player2Result = match.results.find(r => r.player === match.players[1]);
//                                             if (player1Result && player2Result) {
//                                                 winnerId = (player1Result.score > player2Result.score) ? player1Result.player : player2Result.player;
//                                             }
//                                         }

//                                         return (
//                                             <div
//                                                 className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
//                                                 key={match.id}
//                                                 style={{
//                                                     marginBottom: showConnectors ? `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px` : `${MATCH_MARGIN_BOTTOM}px`,
//                                                     ...(matchIndex === roundData.losers.length - 1 && { marginBottom: 0 }),
//                                                 }}
//                                             >
//                                                 {/* Đã loại bỏ div match-info */}
//                                                 <div className="player-pair">
//                                                     {match.players.length > 0 ? ( // Chỉ render player nếu có player
//                                                         match.players.map((playerID, pIdx) => (
//                                                             <div 
//                                                                 key={pIdx} 
//                                                                 className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
//                                                             >
//                                                                 {/* LUÔN hiển thị tên người chơi (hoặc ID nếu không tìm thấy tên) */}
//                                                                 {getPlayerName(playerID)}
//                                                             </div>
//                                                         ))
//                                                     ) : (
//                                                         // Render 2 div trống nếu không có player (cho match placeholder)
//                                                         <>
//                                                             <div className="player empty-player"></div>
//                                                             <div className="player empty-player"></div>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                                 {match.status === 'completed' && match.players.length === 2 && (
//                                                     <div className="match-scores">
//                                                         {match.results.map((res, resIdx) => (
//                                                             <span key={resIdx}>
//                                                                 {getPlayerName(res.player)}: {res.score}
//                                                                 {/* Kiểm tra người thắng và thêm (W) */}
//                                                                 {match.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player === res.player && " (W)"}
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                                 {/* Logic vẽ đường nối cho nhánh thua (tương tự nhánh thắng) */}
//                                                 {roundIndex < bracket.length -1 && (
//                                                     <>
//                                                         <div className="horizontal-line"></div>
//                                                         {showConnectors && (
//                                                             <>
//                                                                 <div 
//                                                                     className="vertical-line"
//                                                                     style={{ 
//                                                                         height: `${getBracketLineSpacing(roundIndex) - MATCH_HEIGHT}px`,
//                                                                         top: `${MATCH_HEIGHT / 2}px`
//                                                                     }}
//                                                                 ></div>
//                                                                 <div 
//                                                                     className="horizontal-line-next"
//                                                                     style={{ 
//                                                                         top: `${MATCH_HEIGHT / 2 + (getBracketLineSpacing(roundIndex) - MATCH_HEIGHT) / 2}px`
//                                                                     }}
//                                                                 ></div>
//                                                             </>
//                                                         )}
//                                                     </>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             )}

//                             {/* Hiển thị Chung kết tổng (Grand Finals) */}
//                             {roundData.grand_finals.length > 0 && (
//                                 <div className="bracket-segment grand-finals-bracket">
//                                     <h4 className="bracket-segment-title">Chung kết tổng</h4>
//                                     {roundData.grand_finals.map((match) => (
//                                         <div
//                                             className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
//                                             key={match.id}
//                                         >
//                                             {/* Đã loại bỏ div match-info */}
//                                             <div className="player-pair">
//                                                 {match.players.length > 0 ? ( // Chỉ render player nếu có player
//                                                     match.players.map((playerID, pIdx) => {
//                                                         let winnerId = null;
//                                                         if (match.status === 'completed' && match.players.length === 2 && match.results && match.results.length === 2) {
//                                                             const player1Result = match.results.find(r => r.player === match.players[0]);
//                                                             const player2Result = match.results.find(r => r.player === match.players[1]);
//                                                             if (player1Result && player2Result) {
//                                                                 winnerId = (player1Result.score > player2Result.score) ? player1Result.player : player2Result.player;
//                                                             }
//                                                         }
//                                                         return (
//                                                             <div 
//                                                                 key={pIdx} 
//                                                                 className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
//                                                             >
//                                                                 {/* LUÔN hiển thị tên người chơi (hoặc ID nếu không tìm thấy tên) */}
//                                                                 {getPlayerName(playerID)}
//                                                             </div>
//                                                         );
//                                                     })
//                                                 ) : (
//                                                     // Render 2 div trống nếu không có player (cho match placeholder)
//                                                     <>
//                                                         <div className="player empty-player"></div>
//                                                         <div className="player empty-player"></div>
//                                                     </>
//                                                 )}
//                                             </div>
//                                             {match.status === 'completed' && match.players.length === 2 && (
//                                                 <div className="match-scores">
//                                                     {match.results.map((res, resIdx) => (
//                                                         <span key={resIdx}>
//                                                             {getPlayerName(res.player)}: {res.score}
//                                                             {/* Kiểm tra người thắng và thêm (W) */}
//                                                             {match.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player === res.player && " (W)"}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     };

//     const renderRankingContent = () => {
//         // Đối với thể thức "Xếp hạng", bạn sẽ cần hiển thị bảng xếp hạng.
//         // Dữ liệu 'players' đã được fetch và có thể được dùng.
//         // Cập nhật: Lấy điểm số từ match format "Xếp hạng" nếu có.
//         const rankingMatch = matches.find(m => m.format === 'Xếp hạng');
//         const playerScoresMap = new Map();
//         if (rankingMatch) {
//             rankingMatch.results.forEach(res => {
//                 playerScoresMap.set(res.player, res.score);
//             });
//         }

//         const playerNamesWithScores = players.map(p => ({
//             id: p.id,
//             playerName: p.name_in_tournament,
//             score: playerScoresMap.get(p.id) || 0, // Lấy điểm thực tế hoặc 0
//         })).sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

//         return (
//             <div className="ranking-container">
//                 <h2>Bảng Xếp Hạng</h2>
//                 <table className="ranking-table">
//                     <thead>
//                         <tr className="table-header">
//                             <th className="table-cell">Hạng</th>
//                             <th className="table-cell">Kỳ Thủ</th>
//                             <th className="table-cell">Điểm</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {playerNamesWithScores.map((player) => (
//                             <tr key={player.id} className="table-row">
//                                 <td className="table-cell">{player.rank}</td>
//                                 <td className="table-cell">{player.playerName}</td>
//                                 <td className="table-cell">{player.score}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     };

//     const renderContentBasedOnFormat = () => {
//         if (!hasTournamentStarted) {
//             return (
//                 <div className="no-schedule-message">
//                     <h2>Giải đấu chưa bắt đầu</h2>
//                     <p>Bảng đấu/xếp hạng sẽ được công bố sau khi giải đấu bắt đầu.</p>
//                 </div>
//             );
//         }

//         switch (tournament.format) {
//             case "Loại trực tiếp":
//             case "Loại lần 2":
//                 return renderBracketData(matches); 
//             case "Xếp hạng":
//                 return renderRankingContent(); 
//             case "TFT": 
//                 return renderBracketData(matches);
//             default:
//                 return (
//                     <div className="no-schedule-message">
//                         <h2>Loại hình giải đấu không xác định hoặc chưa có bảng đấu/xếp hạng.</h2>
//                         <p>Vui lòng kiểm tra lại loại hình giải đấu hoặc chờ cập nhật.</p>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className={styles.pageWrapper}>
//             <div className={styles["banner"]}>
//                 <img
//                     src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
//                     alt={tournament.title}
//                 />
//             </div>

//             <div className={styles["info-section"]}>
//                 <h1>{tournament.title}</h1>
//                 <p>
//                     {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
//                 </p>
//                 <p>{tournament.participants || 0} Participants</p>
//             </div>

//             <div className={styles["tabs"]}>
//                 <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
//                 <button onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>🎮 Các trận đấu</button>
//             </div>
//             {renderContentBasedOnFormat()}
//         </div>
//     );
// }

// export default TournamentDetailBracket;


import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css'; // Cho các style tổng thể trang
import './Bracket.css'; // Cho các style của bracket và ranking table

function TournamentDetailBracket() {
    const { tournament_id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]); // Lưu trữ danh sách các match từ backend
    const [players, setPlayers] = useState([]); // Lưu trữ danh sách người chơi để mapping ID ra tên
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm để fetch dữ liệu từ backend
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            setLoading(true);
            setError(null);

            // Gọi API lấy thông tin giải đấu
            const tournamentRes = await axios.get(
                `http://localhost:5000/api/admin/tournament/${tournament_id}`,
                config
            );
            setTournament(tournamentRes.data);

            // Gọi API lấy danh sách người chơi (để hiển thị tên đầy đủ)
            // Giả định endpoint này trả về danh sách player objects với 'id' và 'name_in_tournament'
            const playersRes = await axios.get(
                `http://localhost:5000/api/admin/members/tournament/${tournament_id}`,
                config
            );
            setPlayers(playersRes.data);

            // Gọi API lấy danh sách match đã tạo cho giải đấu
            const matchesRes = await axios.get(
                `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`,
                config
            );
            setMatches(matchesRes.data);

        } catch (err) {
            console.error("Failed to fetch data:", err);
            if (err.response && err.response.status === 401) {
                setError("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
            } else if (err.response && err.response.status === 404 && err.response.data.message && err.response.data.message.includes('No matches found')) {
                // Nếu chưa có match nào, không phải là lỗi, chỉ là chưa tạo
                setMatches([]);
                setError(null); // Xóa lỗi nếu chỉ là không tìm thấy match
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

    // Hàm xử lý việc tạo bảng đấu (chỉ dành cho admin)
    const handleGenerateBracket = async () => {
        const confirmGenerate = window.confirm("Bạn có chắc chắn muốn tạo bảng đấu cho giải này không? Thao tác này sẽ tạo toàn bộ cấu trúc bracket và không thể hoàn tác nếu đã có match!");
        if (!confirmGenerate) {
            return;
        }

        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        try {
            await axios.post(
                `http://localhost:5000/api/admin/tournament/${tournament_id}/matches`, // Endpoint POST tạo match
                {}, // Body rỗng
                config
            );
            window.alert('Cấu trúc bảng đấu đã được tạo và lưu thành công!');
            fetchData(); // Tải lại dữ liệu để hiển thị các match mới
        } catch (err) {
            console.error("Failed to generate bracket:", err);
            if (err.response && err.response.status === 409) {
                window.alert(err.response.data.message || "Bảng đấu đã tồn tại cho giải đấu này. Vui lòng xóa để tạo lại.");
            } else if (err.response && err.response.status === 400) {
                 window.alert(err.response.data.message || "Không đủ người chơi hoặc không hỗ trợ loại hình/game này để tạo match.");
            }
            else {
                window.alert('Có lỗi xảy ra khi tạo bảng đấu. Vui lòng thử lại.');
            }
        }
    };

    // Hàm xử lý việc tiến độ bảng đấu (cập nhật vòng tiếp theo)
    const handleAdvanceBracket = async () => {
        const confirmAdvance = window.confirm("Bạn có chắc chắn muốn tiến độ bảng đấu sang vòng tiếp theo không? Đảm bảo tất cả các trận đấu ở vòng hiện tại đã hoàn thành!");
        if (!confirmAdvance) {
            return;
        }

        const token = localStorage.getItem("jwtToken");
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        try {
            await axios.post(
                `http://localhost:5000/api/admin/tournament/${tournament_id}/advance-bracket`, // Endpoint POST mới
                {}, // Body rỗng
                config
            );
            window.alert('Bảng đấu đã được tiến độ thành công!');
            fetchData(); // Tải lại dữ liệu để hiển thị vòng mới
        } catch (err) {
            console.error("Failed to advance bracket:", err);
            window.alert(err.response?.data?.message || 'Có lỗi xảy ra khi tiến độ bảng đấu. Vui lòng kiểm tra lại các trận đấu đã hoàn thành.');
        }
    };

    // Hàm để tìm tên người chơi từ ID
    const getPlayerName = useCallback((playerId) => {
        const player = players.find(p => p.id === playerId);
        // Trả về tên hoặc "BYE" nếu đó là BYE_PLAYER, hoặc ID nếu không tìm thấy
        if (playerId && playerId.startsWith('BYE_PLAYER_')) {
            return 'BYE';
        }
        return player ? player.name_in_tournament : playerId; 
    }, [players]);

    if (loading) return <div className="loading">Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

    // Hàm chuyển đổi chuỗi "DD/MM/YYYY" thành đối tượng Date hợp lệ
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
    // const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

    // Hằng số cho chiều cao match
    const MATCH_HEIGHT = 70; 

    // Hàm tính toán khoảng trống cần thiết giữa các match để nối bracket (theo code cũ của bạn)
    const getGapHeight = (roundIndex) => {
        return Math.pow(2, roundIndex) * (MATCH_HEIGHT + 10) - MATCH_HEIGHT;
    };
    
    // Dựng lại logic hiển thị bracket từ `matches` đã fetch
    const renderBracketData = (fetchedMatches) => {
        if (!fetchedMatches || fetchedMatches.length === 0) {
            return (
                <div className="no-schedule-message">
                    <h2>Chưa có bảng đấu</h2>
                    <p>Bảng đấu sẽ được tạo và công bố sau khi giải đấu bắt đầu.</p>
                    {hasTournamentStarted && (
                        <button onClick={handleGenerateBracket} className="generate-bracket-btn">
                            Tạo Bảng Đấu
                        </button>
                    )}
                </div>
            );
        }

        // Nhóm các match theo vòng đấu và nhánh đấu
        const roundsMap = new Map();
        fetchedMatches.forEach(match => {
            const roundKey = match.round;
            const bracketType = match.bracket_type || 'winners'; 
            
            const validBracketTypes = ['winners', 'losers', 'grand_finals'];
            const finalBracketType = validBracketTypes.includes(bracketType) ? bracketType : 'winners';


            if (!roundsMap.has(roundKey)) {
                roundsMap.set(roundKey, { winners: [], losers: [], grand_finals: [] });
            }
            roundsMap.get(roundKey)[finalBracketType].push(match);
        });

        // Sắp xếp các vòng đấu theo số thứ tự vòng
        const sortedRoundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);
        const bracket = sortedRoundNumbers.map(roundNum => {
            const roundData = roundsMap.get(roundNum);
            // Sắp xếp các match trong cùng một nhánh để hiển thị ổn định
            const sortedWinnersMatches = roundData.winners.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
            const sortedLosersMatches = roundData.losers.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
            const sortedGrandFinalsMatches = roundData.grand_finals.sort((a, b) => new Date(a.occurence_day) - new Date(b.occurence_day) || a.id.localeCompare(b.id));
            return {
                roundNumber: roundNum,
                winners: sortedWinnersMatches,
                losers: sortedLosersMatches,
                grand_finals: sortedGrandFinalsMatches
            };
        });

        // Hàm đặt tên vòng đấu
        const getRoundName = (currentRoundNumber, bracketData) => {
            const numMatchesInWinners = bracketData.winners.length;
            // const numMatchesInLosers = bracketData.losers.length; // Not used for naming currently

            if (bracketData.grand_finals.length > 0) {
                return "Chung kết tổng";
            }
            if (tournament.format === 'Loại trực tiếp') {
                if (numMatchesInWinners === 1) return "Chung kết";
                if (numMatchesInWinners === 2) return "Bán kết";
                if (numMatchesInWinners === 4) return "Tứ kết";
                return `Vòng ${currentRoundNumber}`; 
            } else if (tournament.format === 'Loại lần 2') {
                // Logic naming cho DE có thể phức tạp hơn, tùy thuộc vào số vòng của nhánh thắng/thua
                // Nếu bạn có yêu cầu cụ thể hơn cho tên vòng DE, vui lòng cung cấp thêm.
            }
            
            return `Vòng ${currentRoundNumber}`;
        };

        // Xác định vòng đấu cao nhất đã hoàn thành để biết có thể advance hay không
        // Logic này cần tìm các match thực sự (có players) đã completed.
        const maxCompletedRoundNumber = fetchedMatches.reduce((max, match) => 
            match.status === 'completed' && match.players.length > 0 ? Math.max(max, match.round) : max, 0
        );
        
        // Vòng cao nhất tổng thể trong bracket (kể cả placeholder)
        const highestRoundOverall = sortedRoundNumbers.length > 0 ? sortedRoundNumbers[sortedRoundNumbers.length - 1] : 0;
        
        // Có thể tiến độ nếu vòng cao nhất đã hoàn thành (không có match pending) VÀ không phải là vòng cuối cùng của bracket
        let canAdvance = false;
        if (highestRoundOverall > 0) {
             const matchesInHighestOverallRound = bracket.find(r => r.roundNumber === highestRoundOverall);
             const allMatchesInHighestOverallRoundAreCompleted = matchesInHighestOverallRound && 
                                                                 [...matchesInHighestOverallRound.winners, 
                                                                  ...matchesInHighestOverallRound.losers, 
                                                                  ...matchesInHighestOverallRound.grand_finals]
                                                                  .filter(m => m.players.length > 0) // Chỉ xét match có người chơi
                                                                  .every(m => m.status === 'completed');

            // Kiểm tra xem đã đến trận chung kết tổng chưa (nếu là Loại lần 2)
            const isGrandFinalsRound = matchesInHighestOverallRound && matchesInHighestOverallRound.grand_finals.length > 0;
            const isSingleEliminationFinal = tournament.format === 'Loại trực tiếp' && 
                                             matchesInHighestOverallRound && 
                                             matchesInHighestOverallRound.winners.length === 1 && 
                                             matchesInHighestOverallRound.winners[0].players.length > 0;

            if (allMatchesInHighestOverallRoundAreCompleted && !isGrandFinalsRound && !isSingleEliminationFinal) {
                // Nếu vòng cao nhất đã hoàn thành và chưa phải chung kết, thì có thể advance
                canAdvance = true;
            } else if (tournament.format === 'Loại lần 2' && isGrandFinalsRound && matchesInHighestOverallRound.grand_finals.every(m => m.status === 'completed')) {
                // Grand Finals đã hoàn thành, giải đấu kết thúc.
                canAdvance = false;
            }
        }


        // Kiểm tra nếu giải đấu đã kết thúc
        let isTournamentCompleted = false;
        let winnerOfTournament = null;

        // Tìm match chung kết tổng hoặc chung kết nhánh thắng cuối cùng
        const finalMatches = fetchedMatches.filter(m => 
            m.bracket_type === 'grand_finals' || 
            (tournament.format === 'Loại trực tiếp' && m.round === highestRoundOverall && m.bracket_type === 'winners' && m.players.length === 2)
        ).sort((a,b) => b.round - a.round); // Lấy match có round cao nhất

        if (finalMatches.length > 0) {
            const finalMatch = finalMatches[0];
            if (finalMatch.status === 'completed' && finalMatch.players.length === 2 && finalMatch.results.length === 2) {
                isTournamentCompleted = true;
                winnerOfTournament = finalMatch.results.reduce((prev, current) => (prev.score > current.score ? prev : current)).player;
            }
        }


        return (
            <div className="bracket-page"> {/* Wrapper chính cho bracket */}
                <div className="bracket-controls">
                    {/* Nút tiến độ vòng tiếp theo */}
                    {!isTournamentCompleted && hasTournamentStarted && canAdvance &&
                        (tournament.format === 'Loại trực tiếp' || tournament.format === 'Loại lần 2') && (
                        <button onClick={handleAdvanceBracket} className="advance-bracket-btn">
                            Cập nhật vòng Tiếp Theo
                        </button>
                    )}
                    {isTournamentCompleted && (
                         <div className="tournament-complete-message">
                            Giải đấu đã kết thúc! Nhà vô địch: **{getPlayerName(winnerOfTournament)}**
                        </div>
                    )}
                </div>

                <div className="bracket-container">
                    {bracket.map((roundData, roundIndex) => (
                        <div className="round" key={roundIndex}>
                            <div className="round-title">
                                {getRoundName(roundData.roundNumber, roundData)} {/* Sử dụng hàm getRoundName */}
                            </div>
                            
                            {/* Hiển thị Nhánh Thắng (Winners' Bracket) */}
                            {roundData.winners.length > 0 && (
                                <div className="bracket-segment winners-bracket">
                                    {tournament.format === 'Loại lần 2' && <h4 className="bracket-segment-title">Nhánh thắng</h4>}
                                    {roundData.winners.map((match, matchIndex) => {
                                        // Kiểm tra xem có cần đường nối hay không (match cuối của cặp và không phải vòng cuối)
                                        const isFirstMatchInPair = matchIndex % 2 === 0;
                                        const hasNextMatchInPair = matchIndex + 1 < roundData.winners.length;
                                        const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

                                        // Xác định người thắng để in đậm
                                        let winnerId = null;
                                        if (match.status === 'completed' && match.players.length > 0 && match.results && match.results.length > 0) {
                                            // Lấy người có điểm cao nhất
                                            const highestScoreResult = match.results.reduce((prev, current) => (prev.score > current.score ? prev : current));
                                            winnerId = highestScoreResult.player;
                                        }

                                        return (
                                            <div
                                                className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
                                                key={match.id}
                                                style={{
                                                    marginBottom: matchIndex !== roundData.winners.length - 1 ? `${getGapHeight(roundIndex)}px` : 0,
                                                }}
                                            >
                                                <div className="player-pair">
                                                    {match.players.length > 0 ? ( // Chỉ render player nếu có player
                                                        match.players.map((playerID, pIdx) => (
                                                            <div 
                                                                key={pIdx} 
                                                                className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
                                                            >
                                                                {getPlayerName(playerID)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Render 2 div trống nếu không có player (cho match placeholder)
                                                        <>
                                                            <div className="player empty-player"></div>
                                                            <div className="player empty-player"></div>
                                                        </>
                                                    )}
                                                </div>
                                                {match.status === 'completed' && match.players.length > 0 && match.results.length > 0 && (
                                                    <div className="match-scores">
                                                        {match.results.map((res, resIdx) => {
                                                            const isWinner = winnerId === res.player;
                                                            return (
                                                                <span key={resIdx}>
                                                                    {getPlayerName(res.player)}: {res.score}
                                                                    {isWinner && " (W)"}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {/* Logic vẽ đường nối */}
                                                {roundIndex < bracket.length - 1 && (
                                                    <>
                                                        <div className="horizontal-line"></div> 
                                                        {showConnectors && (
                                                            <>
                                                                <div 
                                                                    className="vertical-line"
                                                                    style={{ 
                                                                        height: `${MATCH_HEIGHT + getGapHeight(roundIndex)}px`,
                                                                        top: `${MATCH_HEIGHT / 2}px` 
                                                                    }}
                                                                ></div>
                                                                <div 
                                                                    className="horizontal-line-next"
                                                                    style={{ 
                                                                        top: `${getGapHeight(roundIndex) / 2 + MATCH_HEIGHT}px`
                                                                    }}
                                                                ></div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Hiển thị Nhánh Thua (Losers' Bracket) - chỉ cho Loại lần 2 */}
                            {tournament.format === 'Loại lần 2' && roundData.losers.length > 0 && (
                                <div className="bracket-segment losers-bracket">
                                    <h4 className="bracket-segment-title">Nhánh thua</h4>
                                    {roundData.losers.map((match, matchIndex) => {
                                        const isFirstMatchInPair = matchIndex % 2 === 0;
                                        const hasNextMatchInPair = matchIndex + 1 < roundData.losers.length;
                                        const showConnectors = isFirstMatchInPair && hasNextMatchInPair && roundIndex < bracket.length - 1;

                                        // Xác định người thắng để in đậm
                                        let winnerId = null;
                                        if (match.status === 'completed' && match.players.length > 0 && match.results && match.results.length > 0) {
                                            const highestScoreResult = match.results.reduce((prev, current) => (prev.score > current.score ? prev : current));
                                            winnerId = highestScoreResult.player;
                                        }

                                        return (
                                            <div
                                                className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
                                                key={match.id}
                                                style={{
                                                    marginBottom: matchIndex !== roundData.losers.length - 1 ? `${getGapHeight(roundIndex)}px` : 0,
                                                }}
                                            >
                                                <div className="player-pair">
                                                    {match.players.length > 0 ? ( // Chỉ render player nếu có player
                                                        match.players.map((playerID, pIdx) => (
                                                            <div 
                                                                key={pIdx} 
                                                                className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
                                                            >
                                                                {getPlayerName(playerID)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Render 2 div trống nếu không có player (cho match placeholder)
                                                        <>
                                                            <div className="player empty-player"></div>
                                                            <div className="player empty-player"></div>
                                                        </>
                                                    )}
                                                </div>
                                                {match.status === 'completed' && match.players.length > 0 && match.results.length > 0 && (
                                                    <div className="match-scores">
                                                        {match.results.map((res, resIdx) => {
                                                            const isWinner = winnerId === res.player;
                                                            return (
                                                                <span key={resIdx}>
                                                                    {getPlayerName(res.player)}: {res.score}
                                                                    {isWinner && " (W)"}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {/* Logic vẽ đường nối cho nhánh thua (tương tự nhánh thắng) */}
                                                {roundIndex < bracket.length - 1 && (
                                                    <>
                                                        <div className="horizontal-line"></div>
                                                        {showConnectors && (
                                                            <>
                                                                <div 
                                                                    className="vertical-line"
                                                                    style={{ 
                                                                        height: `${MATCH_HEIGHT + getGapHeight(roundIndex)}px`,
                                                                        top: `${MATCH_HEIGHT / 2}px`
                                                                    }}
                                                                ></div>
                                                                <div 
                                                                    className="horizontal-line-next"
                                                                    style={{ 
                                                                        top: `${getGapHeight(roundIndex) / 2 + MATCH_HEIGHT}px`
                                                                    }}
                                                                ></div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Hiển thị Chung kết tổng (Grand Finals) */}
                            {roundData.grand_finals.length > 0 && (
                                <div className="bracket-segment grand-finals-bracket">
                                    <h4 className="bracket-segment-title">Chung kết tổng</h4>
                                    {roundData.grand_finals.map((match) => {
                                        let winnerId = null;
                                        if (match.status === 'completed' && match.players.length > 0 && match.results.length > 0) {
                                            const highestScoreResult = match.results.reduce((prev, current) => (prev.score > current.score ? prev : current));
                                            winnerId = highestScoreResult.player;
                                        }

                                        return (
                                            <div
                                                className={`match ${match.status === 'completed' ? 'match-completed' : 'match-pending'}`}
                                                key={match.id}
                                            >
                                                <div className="player-pair">
                                                    {match.players.length > 0 ? ( // Chỉ render player nếu có player
                                                        match.players.map((playerID, pIdx) => (
                                                            <div 
                                                                key={pIdx} 
                                                                className={`player ${match.status === 'completed' && playerID === winnerId ? 'winner' : ''}`}
                                                            >
                                                                {getPlayerName(playerID)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <div className="player empty-player"></div>
                                                            <div className="player empty-player"></div>
                                                        </>
                                                    )}
                                                </div>
                                                {match.status === 'completed' && match.players.length > 0 && match.results.length > 0 && (
                                                    <div className="match-scores">
                                                        {match.results.map((res, resIdx) => {
                                                            const isWinner = winnerId === res.player;
                                                            return (
                                                                <span key={resIdx}>
                                                                    {getPlayerName(res.player)}: {res.score}
                                                                    {isWinner && " (W)"}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderRankingContent = () => {
        const playerScoresMap = new Map();
        // Giả sử logic lấy điểm cho ranking từ matches đã có
        const rankingMatch = matches.find(m => m.format === 'Xếp hạng');
        if (rankingMatch && rankingMatch.results) {
            rankingMatch.results.forEach(res => {
                playerScoresMap.set(res.player, res.score);
            });
        }

        const playerNamesWithScores = players.map(p => ({
            id: p.id,
            playerName: p.name_in_tournament,
            score: playerScoresMap.get(p.id) || 0, // Lấy điểm thực tế hoặc 0
        })).sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

        return (
            <div className="ranking-container">
                <h2>Bảng Xếp Hạng</h2>
                <table className="ranking-table">
                    <thead>
                        <tr className="table-header">
                            <th className="table-cell">Hạng</th>
                            <th className="table-cell">Kỳ Thủ</th>
                            <th className="table-cell">Điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerNamesWithScores.map((player) => (
                            <tr key={player.id} className="table-row">
                                <td className="table-cell">{player.rank}</td>
                                <td className="table-cell">{player.playerName}</td>
                                <td className="table-cell">{player.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContentBasedOnFormat = () => {
        if (!hasTournamentStarted) {
            return (
                <div className="no-schedule-message">
                    <h2>Giải đấu chưa bắt đầu</h2>
                    <p>Bảng đấu/xếp hạng sẽ được công bố sau khi giải đấu bắt đầu.</p>
                </div>
            );
        }

        switch (tournament.format) {
            case "Loại trực tiếp":
            case "Loại lần 2":
                return renderBracketData(matches); 
            case "Xếp hạng":
                return renderRankingContent(); 
            case "TFT": 
                return renderBracketData(matches);
            default:
                return (
                    <div className="no-schedule-message">
                        <h2>Loại hình giải đấu không xác định hoặc chưa có bảng đấu/xếp hạng.</h2>
                        <p>Vui lòng kiểm tra lại loại hình giải đấu hoặc chờ cập nhật.</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles["banner"]}>
                <img
                    src={tournament.image?.startsWith('http') ? tournament.image : `/${tournament.image || 'images/default-banner.jpg'}`}
                    alt={tournament.title}
                />
            </div>

            <div className={styles["info-section"]}>
                <h1>{tournament.title}</h1>
                <p>
                    {/* {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()} */}
                    {tournament.start_date}  -  {tournament.end_date}
                </p>
                <p>{tournament.participants || 0} Participants</p>
            </div>

            <div className={styles["tabs"]}>
                <button onClick={() => navigate(`/tournament/${tournament_id}`)}>📊 Bảng thi đấu</button>
                <button onClick={() => navigate(`/tournament/${tournament_id}/matches`)}>🎮 Các trận đấu</button>
            </div>
            {renderContentBasedOnFormat()}
        </div>
    );
}

export default TournamentDetailBracket;
