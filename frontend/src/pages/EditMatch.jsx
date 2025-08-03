import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './TournamentDetail.module.css'; 
function MatchEditPage() {
  const { id, matchId } = useParams(); 
  const navigate = useNavigate();
  const [match, setMatch] = useState(null); 
  const [matchStatus, setMatchStatus] = useState('');
  const [scorePlayer1, setScorePlayer1] = useState('');
  const [scorePlayer2, setScorePlayer2] = useState('');
  const [highlightLink, setHighlightLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const mockMatchData = {
      player1: 'Kỳ thủ 1',
      player2: 'Kỳ thủ 2',
      time: '13:00 16/06/2025',
      status: 'Sắp diễn ra', 
      score1: '',
      score2: '',
      highlight: '',
      notes: '',
    };
    setMatch(mockMatchData);
    setMatchStatus(mockMatchData.status);
    setScorePlayer1(mockMatchData.score1);
    setScorePlayer2(mockMatchData.score2);
    setHighlightLink(mockMatchData.highlight);
    setNotes(mockMatchData.notes);
  }, [id, matchId]);

  const handleSave = () => {
    console.log('Lưu thông tin trận đấu:', {
      matchId,
      matchStatus,
      scorePlayer1,
      scorePlayer2,
      highlightLink,
      notes,
    });
    alert('Thông tin trận đấu đã được cập nhật!'); // Sử dụng alert tạm thời
    navigate(`/tournament/${id}/matches`); 
  };

  if (!match) return <div className="loading">Đang tải...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.matchCardEdit}>
        <div className={styles.matchInfoEdit}>
          <div className={styles.playerAvatar}>Avt</div>
          <span>{match.player1}</span>
          <span>Vs</span>
          <span>{match.player2}</span>
          <div className={styles.playerAvatar}>Avt</div>
        </div>
        <span className={styles.matchTimeEdit}>Sắp Diễn Ra Vào {match.time}</span>
      </div>

      {/* Form điều chỉnh */}
      <div className={styles.editFormContainer}>
        <h2>Cập Nhật</h2>
        <div className={styles.formGroup}>
          <label htmlFor="matchStatus">Trạng thái trận đấu</label>
          <select
            id="matchStatus"
            className={styles.selectField}
            value={matchStatus}
            onChange={(e) => setMatchStatus(e.target.value)}
          >
            <option value="Sắp diễn ra">Sắp diễn ra</option>
            <option value="Đang diễn ra">Đang diễn ra</option>
            <option value="Kết thúc">Kết thúc</option>
            <option value="Tạm hoãn">Tạm hoãn</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Tỉ số kỳ thủ 1"
            value={scorePlayer1}
            onChange={(e) => setScorePlayer1(e.target.value)}
          />
          <input
            type="text"
            className={styles.inputField}
            placeholder="Tỉ số kỳ thủ 2"
            value={scorePlayer2}
            onChange={(e) => setScorePlayer2(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="highlightLink">Link highlight</label>
          <input
            type="text"
            id="highlightLink"
            className={styles.inputField}
            placeholder="Nội dung"
            value={highlightLink}
            onChange={(e) => setHighlightLink(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Ghi chú</label>
          <textarea
            id="notes"
            className={styles.textareaField}
            placeholder="Nội dung"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <button className={styles.saveButton} onClick={handleSave}>
          Lưu
        </button>
      </div>
    </div>
  );
}

export default MatchEditPage;
