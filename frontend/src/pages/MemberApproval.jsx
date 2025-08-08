import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MemberApproval.enhanced.css';

const MemberApproval = () => {
  const [members, setMembers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentFilter, setTournamentFilter] = useState('all'); // Thêm filter theo giải đấu
  const [filter, setFilter] = useState('all'); // Trạng thái filter
  useEffect(() => {
    fetchTournaments();
    fetchMembers();
  }, []);

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

  const filteredMembers = members.filter(member => {
    // Filter by status
    if (filter !== 'all' && member.status !== filter) return false;
    
    // Filter by tournament
    if (tournamentFilter !== 'all' && member.tournament_id !== tournamentFilter) return false;
    
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Chờ duyệt', class: 'status-pending' },
      approved: { text: 'Đã duyệt', class: 'status-approved' },
      rejected: { text: 'Từ chối', class: 'status-rejected' }
    };
    return badges[status] || badges.pending;
  };

  const getAvatarText = (name, email) => {
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getTournamentName = (tournamentId) => {
    if (!tournamentId) return 'Không xác định';
    
    const tournament = tournaments.find(t => t._id === tournamentId);
    if (tournament) {
      return tournament.title;
    }
    return 'Giải đã xóa';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    };
    return statusMap[status] || 'Không rõ';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="member-approval-container">
      {/* Header với gradient và stats */}
      <div className="approval-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">👥</span>
            Duyệt Thành Viên Tham Gia
          </h1>
          <p className="page-subtitle">Quản lý và duyệt thành viên cho các giải đấu</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{filteredMembers.filter(m => m.status === 'pending').length}</div>
            <div className="stat-label">Chờ duyệt</div>
          </div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{filteredMembers.filter(m => m.status === 'approved').length}</div>
            <div className="stat-label">Đã duyệt</div>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">{filteredMembers.filter(m => m.status === 'rejected').length}</div>
            <div className="stat-label">Từ chối</div>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{members.length}</div>
            <div className="stat-label">Tổng cộng</div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả ({members.length})</option>
              <option value="pending">Chờ duyệt ({members.filter(m => m.status === 'pending').length})</option>
              <option value="approved">Đã duyệt ({members.filter(m => m.status === 'approved').length})</option>
              <option value="rejected">Từ chối ({members.filter(m => m.status === 'rejected').length})</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Giải đấu:</label>
            <select 
              value={tournamentFilter} 
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả giải đấu</option>
              {tournaments.map(tournament => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="members-table-container">
          {/* Enhanced Table */}
          <div className="table-container">
            <table className="members-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thành viên</th>
                  <th>Thông tin liên hệ</th>
                  <th>Tên in-game</th>
                  <th>Giải đấu</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr key={member._id} className={`member-row status-${member.status}`}>
                    <td className="stt-cell">{index + 1}</td>
                    <td className="member-info-cell">
                      <div className="member-info">
                        <div className="member-avatar">
                          {getAvatarText(member.full_name, member.email)}
                        </div>
                        <div className="member-details">
                          <div className="member-name">{member.full_name || 'Chưa cập nhật'}</div>
                          <div className="member-id">ID: {member.personal_id || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-cell">
                      <div className="contact-info">
                        <div className="email">{member.email}</div>
                        <div className="phone">{member.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="ingame-cell">
                      <div className="ingame-name">
                        {member.name_in_tournament || member.full_name || 'Chưa đặt tên'}
                      </div>
                    </td>
                    <td className="tournament-cell">
                      <div className="tournament-info">
                        {getTournamentName(member.tournament_id)}
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(member.register_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${member.status}`}>
                        {getStatusText(member.status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {member.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproval(member._id, 'approved')}
                              className="btn-approve"
                              title="Duyệt thành viên"
                            >
                              ✓ Duyệt
                            </button>
                            <button 
                              onClick={() => handleApproval(member._id, 'rejected')}
                              className="btn-reject"
                              title="Từ chối"
                            >
                              ✗ Từ chối
                            </button>
                          </>
                        )}
                        {member.status === 'approved' && (
                          <button 
                            onClick={() => handleApproval(member._id, 'rejected')}
                            className="btn-reject"
                            title="Hủy duyệt"
                          >
                            ✗ Hủy duyệt
                          </button>
                        )}
                        {member.status === 'rejected' && (
                          <button 
                            onClick={() => handleApproval(member._id, 'approved')}
                            className="btn-approve"
                            title="Duyệt lại"
                          >
                            ✓ Duyệt lại
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMembers.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>Không có thành viên nào</h3>
                <p>Không có thành viên nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberApproval;