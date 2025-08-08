import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './RegisterUser.module.css';

const RegisterUser = ({ tournamentId: propTournamentId, isModal = false, onSuccess }) => {
  // CHỈ CÁC FIELD THEO ĐÚNG SCHEMA REGISTER
  const [formData, setFormData] = useState({
    full_name: '',
    personal_id: '',
    email: '',
    phone: '',
    name_in_tournament: ''
  });
  const [loading, setLoading] = useState(false);
  const [tournament, setTournament] = useState(null);
  const navigate = useNavigate();
  const { tournamentId: paramTournamentId } = useParams();
  
  // Sử dụng tournamentId từ props hoặc từ URL params
  const tournamentId = propTournamentId || paramTournamentId;

  // Lấy thông tin tournament từ API
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/tournament/${tournamentId}`);
        setTournament(response.data);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        // Fallback data nếu không lấy được
        setTournament({
          title: 'Chess EArena 2025',
          start_date: 'Jan 2025',
          end_date: '6 Jul 2025',
          participants: 200
        });
      }
    };

    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gửi cả tournament ID
      const submitData = {
        ...formData,
        tournament_id: tournamentId
      };
      
      await axios.post('http://localhost:5000/api/register', submitData);
      alert('Đăng ký thành công! Vui lòng chờ admin duyệt.');
      
      if (isModal && onSuccess) {
        onSuccess(); // Đóng modal nếu đăng ký thành công trong modal
      } else {
        navigate('/tournaments');
      }
    } catch (error) {
      alert('Đăng ký thất bại: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  if (!tournament) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['loading-spinner']}></div>
        <p>Đang tải thông tin giải đấu...</p>
      </div>
    );
  }

  return (
    <div className={isModal ? styles['register-container-modal'] : styles['register-container']}>
      {!isModal && (
        <div className={styles['register-hero']}>
          <div className={styles['hero-content']}>
            <h1>{tournament.title}</h1>
            <p>📅 {tournament.start_date} - {tournament.end_date}</p>
            <p>👥 {tournament.participants} PARTICIPANTS</p>
          </div>
          <div className={styles['hero-image']}>
            <img 
              src={tournament.image || "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=300&fit=crop"} 
              alt={tournament.title} 
            />
          </div>
        </div>
      )}

      <div className={styles['register-form-container']}>
        <div className={styles['form-overlay']}>
          <h2>Đăng ký tham gia - {tournament.title}</h2>
          {/* FORM CHỈ CHỨA CÁC FIELD THEO SCHEMA REGISTER - KHÔNG CÓ TRÌNH ĐỘ, TEAM, GHI CHÚ */}
          <form onSubmit={handleSubmit} className={styles['register-form']}>
            <div className={styles['form-group']}>
              <label>Họ tên</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label>CCCD/STTN</label>
              <input
                type="text"
                name="personal_id"
                value={formData.personal_id}
                onChange={handleChange}
                placeholder="Nhập số CCCD hoặc STTN"
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email"
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label>Tên trong giải đấu</label>
              <input
                type="text"
                name="name_in_tournament"
                value={formData.name_in_tournament}
                onChange={handleChange}
                placeholder="Tên hiển thị trong giải đấu"
                required
              />
            </div>

            <div className={styles['form-actions']}>
              <button type="submit" className={styles['submit-btn']} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký tham gia'}
              </button>
              {!isModal && (
                <button 
                  type="button" 
                  className={styles['cancel-btn']} 
                  onClick={() => navigate('/tournaments')}
                >
                  Quay lại
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;