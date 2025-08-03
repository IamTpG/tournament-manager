import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css';

function TournamentDetailBracket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:5000/api/admin/tournament/${id}`);
        setTournament(res.data);
      } catch (err) {
        console.error("Failed to fetch tournament details:", err);
        setError("Không thể tải thông tin giải đấu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tournament) return <div className="loading">Không tìm thấy giải đấu.</div>;

  const hasTournamentStarted = new Date() >= new Date(tournament.start_date);

  const playerNamesList = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Duyên",
    "Hoàng Minh Giang", "Đỗ Thị Hạnh", "Vũ Trung Kiên", "Đặng Thị Lan",
    "Bùi Văn Mạnh", "Ngô Thị Nga", "Trịnh Quang Phát", "Đinh Thị Quỳnh",
    "Lý Văn Sơn", "Châu Thị Thảo", "Tô Văn Tùng", "Dương Thị Uyên",
    "Cao Văn Việt", "Lâm Thị Xuân", "Phan Văn Yến", "Trương Thị Zara"
  ];

  const generatePlayerDisplayName = (baseName, index, totalPlayers) => {
    if (totalPlayers > playerNamesList.length) {
      return `${baseName} (${index + 1})`;
    }
    return baseName;
  };

  const generateMockRankings = (numParticipants) => {
    const rankings = [];
    for (let i = 0; i < numParticipants; i++) {
      const baseName = playerNamesList[i % playerNamesList.length];
      const playerName = generatePlayerDisplayName(baseName, i, numParticipants);

      rankings.push({
        id: `player-${i}`,
        playerName: playerName,
        score: Math.floor(Math.random() * 100) + 50,
        wins: Math.floor(Math.random() * (numParticipants / 2)),
        losses: Math.floor(Math.random() * (numParticipants / 2)),
      });
    }
    rankings.sort((a, b) => b.score - a.score);
    return rankings.map((player, index) => ({ ...player, rank: index + 1 }));
  };

  const generateSingleEliminationBracket = (numParticipants) => {
    const rounds = [];
    let initialPlayers = [];
  
    for (let i = 0; i < numParticipants; i++) {
      const baseName = playerNamesList[i % playerNamesList.length];
      const displayName = generatePlayerDisplayName(baseName, i, numParticipants);
      initialPlayers.push({ name: displayName }); // ⬅️ lưu dưới dạng object
    }
  
    initialPlayers.sort(() => Math.random() - 0.5);
  
    let currentRoundPlayers = [...initialPlayers];
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
  
    for (let i = numParticipants; i < nextPowerOf2; i++) {
      currentRoundPlayers.push({ name: "BYE" });
    }
  
    currentRoundPlayers.sort(() => Math.random() - 0.5);
  
    let roundNum = 1;
  
    while (currentRoundPlayers.length >= 2) {
      const matchesInRound = currentRoundPlayers.length / 2;
      const roundMatches = [];
      const nextRoundPlayers = [];
  
      for (let i = 0; i < matchesInRound; i++) {
        const player1 = currentRoundPlayers[i * 2];
        const player2 = currentRoundPlayers[i * 2 + 1];
  
        let winner;
        if (player1.name === "BYE") {
          winner = player2;
        } else if (player2.name === "BYE") {
          winner = player1;
        } else {
          const p1LastName = player1.name.split(' ').pop().replace(/\(\d+\)/, '').trim();
          const p2LastName = player2.name.split(' ').pop().replace(/\(\d+\)/, '').trim();
          winner = {
            name: `Thắng ${p1LastName} vs ${p2LastName}`,
            children: [player1, player2]
          };
        }
  
        roundMatches.push({ player1, player2, winner });
        nextRoundPlayers.push(winner);
      }
  
      rounds.push({
        name: currentRoundPlayers.length === 2 ? "Chung Kết" :
              currentRoundPlayers.length === 4 ? "Bán Kết" :
              currentRoundPlayers.length === 8 ? "Tứ Kết" :
              `Vòng ${roundNum}`,
        matches: roundMatches
      });
  
      currentRoundPlayers = nextRoundPlayers;
      roundNum++;
    }
  
    return rounds;
  };

  
  const renderBracketOrRankingContent = () => {
    if (!hasTournamentStarted) {
      return (
        <div className={styles.noScheduleMessage}>
          <h2>Giải đấu chưa bắt đầu</h2>
          <p>Bảng đấu/xếp hạng sẽ được công bố sau khi giải đấu bắt đầu.</p>
        </div>
      );
    }

    switch (tournament.format) {
      case "Loại trực tiếp":
        const singleEliminationBracket = generateSingleEliminationBracket(tournament.participants);
        return (
          <div className={styles.bracketContainer}>
            <h2>Bảng Đấu Loại Trực Tiếp</h2>
            <div className={styles.bracketRounds}>
              {singleEliminationBracket.map((round, roundIndex) => (
                <div key={roundIndex} className={styles.bracketRound}>
                  <h3>{round.name}</h3>
                  {round.matches.map((match, matchIndex) => (
                    <div key={matchIndex} className={styles.matchup}>
                      <div className={styles.player}>{match.player1.name}</div>
                      <div className={styles.player}>{match.player2.name}</div>
                      {(match.player1.name === "BYE" || match.player2.name === "BYE") ? (
                        <div className={styles.byeWinner}>({match.winner.name} thắng BYE)</div>
                      ) : (
                        <div className={styles.matchWinner}>({match.winner.name})</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      
      case "Loại lần 2":
        return (
          <div className={styles.bracketContainer}>
            <h2>Bảng Đấu Loại Trực Tiếp (Kép)</h2>
            <div className={styles.doubleEliminationLayout}>
              <div className={styles.bracketSection}>
                <h3>Nhánh Thắng</h3>
                <div className={styles.bracketRounds}>
                  <div className={styles.bracketRound}>
                    <h3>Vòng 1</h3>
                    <div className={styles.matchup}><div className={styles.player}>WT-P1</div><div className={styles.player}>WT-P2</div></div>
                    <div className={styles.matchup}><div className={styles.player}>WT-P3</div><div className={styles.player}>WT-P4</div></div>
                  </div>
                  <div className={styles.bracketRound}>
                    <h3>Vòng 2</h3>
                    <div className={styles.matchup}><div className={styles.player}>WT-Winner1</div><div className={styles.player}>WT-Winner2</div></div>
                  </div>
                </div>
              </div>
              <div className={styles.bracketSection}>
                <h3>Nhánh Thua</h3>
                <div className={styles.bracketRounds}>
                  <div className={styles.bracketRound}>
                    <h3>Vòng 1</h3>
                    <div className={styles.matchup}><div className={styles.player}>LT-P1</div><div className={styles.player}>LT-P2</div></div>
                    <div className={styles.matchup}><div className={styles.player}>LT-P3</div><div className={styles.player}>LT-P4</div></div>
                  </div>
                  <div className={styles.bracketRound}>
                    <h3>Vòng 2</h3>
                    <div className={styles.matchup}><div className={styles.player}>LT-Winner1</div><div className={styles.player}>LT-Winner2</div></div>
                  </div>
                </div>
              </div>
              <div className={styles.bracketSection}>
                <h3>Chung Kết Tổng</h3>
                <div className={styles.bracketRounds}>
                  <div className={styles.bracketRound}>
                    <h3>Grand Final</h3>
                    <div className={styles.matchup}><div className={styles.player}>Winner Bracket Final</div><div className={styles.player}>Loser Bracket Final</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Xếp hạng":
        const rankings = generateMockRankings(tournament.participants);
        return (
          <div className={styles.rankingContainer}>
            <h2>Bảng Xếp Hạng</h2>
            <table className={styles.rankingTable}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.tableCell}>Hạng</th>
                  <th className={styles.tableCell}>Kỳ Thủ</th>
                  <th className={styles.tableCell}>Điểm</th>
                  <th className={styles.tableCell}>Thắng</th>
                  <th className={styles.tableCell}>Thua</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map(player => (
                  <tr key={player.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{player.rank}</td>
                    <td className={styles.tableCell}>{player.playerName}</td>
                    <td className={styles.tableCell}>{player.score}</td>
                    <td className={styles.tableCell}>{player.wins}</td>
                    <td className={styles.tableCell}>{player.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className={styles.noScheduleMessage}>
            <h2>Loại hình giải đấu không xác định hoặc chưa có bảng đấu/xếp hạng.</h2>
            <p>Vui lòng kiểm tra lại loại hình giải đấu hoặc chờ cập nhật.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.pageWrapper}>
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
        </div>
        <div className={styles["tabs"]}> 
          <button onClick={() => navigate(`/tournament/${id}/rank`)}>📊 Bảng thi đấu</button>
          <button onClick={() => navigate(`/tournament/${id}/matches`)}>🎮 Các trận đấu</button>
        </div>
        {renderBracketOrRankingContent()}

      <div className={styles.footerArrow}>
        <div className={styles.arrow}></div>
      </div>
    </div>
  );
}

export default TournamentDetailBracket;
