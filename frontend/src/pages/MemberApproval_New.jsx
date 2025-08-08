import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './MemberApproval_New.module.css';

const MemberApproval = () => {
  const [members, setMembers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
    fetchMembers();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/tournament/get');
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:5000/api/admin/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
    setLoading(false);
  };

  const handleApproval = async (memberId, status) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(`http://localhost:5000/api/admin/members/${memberId}/approve`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh data
      fetchMembers();
      alert(`Thành viên đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}!`);
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.response?.data?.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Chờ duyệt', class: styles['status-pending'] },
      approved: { text: 'Đã duyệt', class: styles['status-approved'] },
      rejected: { text: 'Từ chối', class: styles['status-rejected'] }
    };
    return badges[status] || badges.pending;
  };

  const getTournamentName = (tournamentId) => {
    const tournament = tournaments.find(t => t._id === tournamentId);
    return tournament ? tournament.title : 'Không xác định';
  };

  const filteredMembers = members.filter(member => {
    const statusMatch = filter === 'all' || member.status === filter;
    const tournamentMatch = selectedTournament === 'all' || member.tournament_id === selectedTournament;
    return statusMatch && tournamentMatch;
  });

  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['loading-spinner']}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className={styles['member-approval-container']}>
      {/* Header */}
      <header className={styles['admin-header']}>
        <div className={styles['header-content']}>
          <h1>🏆 Quản lý thành viên giải đấu</h1>
          <button className={styles['logout-btn']} onClick={() => {
            localStorage.removeItem('jwtToken');
            navigate('/login');
          }}>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Tournament Banner */}
      <div className={styles['tournament-banner']}>
        <div className={styles['banner-overlay']}></div>
        <div className={styles['banner-content']}>
          <div className={styles['tournament-info']}>
            <h2>Chess EArena 2025</h2>
            <div className={styles['tournament-stats']}>
              <span>📅 Đang diễn ra</span>
              <span>👥 {members.length} đăng ký</span>
              <span>✅ {members.filter(m => m.status === 'approved').length} đã duyệt</span>
              <span>⏳ {members.filter(m => m.status === 'pending').length} chờ duyệt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles['filters-container']}>
        <div className={styles['filter-group']}>
          <label>Trạng thái:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles['filter-select']}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
        
        <div className={styles['filter-group']}>
          <label>Giải đấu:</label>
          <select 
            value={selectedTournament} 
            onChange={(e) => setSelectedTournament(e.target.value)}
            className={styles['filter-select']}
          >
            <option value="all">Tất cả giải đấu</option>
            {tournaments.map(tournament => (
              <option key={tournament._id} value={tournament._id}>
                {tournament.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className={styles['table-container']}>
        <table className={styles['members-table']}>
          <thead>
            <tr>
              <th>Họ Tên</th>
              <th>SĐT</th>
              <th>CCCD</th>
              <th>Email</th>
              <th>Tên Trong Giải</th>
              <th>Giải Đấu</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => {
              const statusBadge = getStatusBadge(member.status);
              return (
                <tr key={member._id} className={styles['member-row']}>
                  <td className={styles['member-name']}>{member.full_name}</td>
                  <td>{member.phone}</td>
                  <td>{member.personal_id}</td>
                  <td>{member.email}</td>
                  <td className={styles['tournament-name']}>{member.name_in_tournament}</td>
                  <td className={styles['tournament-title']}>{getTournamentName(member.tournament_id)}</td>
                  <td>
                    <span className={`${styles['status-badge']} ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className={styles['actions']}>
                    {member.status === 'pending' && (
                      <>
                        <button 
                          className={styles['approve-btn']}
                          onClick={() => handleApproval(member._id, 'approved')}
                        >
                          Duyệt
                        </button>
                        <button 
                          className={styles['reject-btn']}
                          onClick={() => handleApproval(member._id, 'rejected')}
                        >
                          Từ Chối
                        </button>
                      </>
                    )}
                    {member.status === 'approved' && (
                      <button 
                        className={styles['revert-btn']}
                        onClick={() => handleApproval(member._id, 'pending')}
                      >
                        Hoàn Tác
                      </button>
                    )}
                    {member.status === 'rejected' && (
                      <button 
                        className={styles['approve-btn']}
                        onClick={() => handleApproval(member._id, 'approved')}
                      >
                        Duyệt Lại
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredMembers.length === 0 && (
          <div className={styles['no-data']}>
            <p>🎯 Không có thành viên nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className={styles['summary']}>
        <p>Tổng: <strong>{filteredMembers.length}</strong> thành viên</p>
      </div>
    </div>
  );
};

export default MemberApproval;
