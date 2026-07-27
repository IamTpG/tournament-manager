import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './RegisterUser.module.css';
import { isAlphaNum, isEmail, isPhone, checkRequired, getServerError } from '../utils/validation';

const REQUIRED_FIELDS = ['full_name', 'personal_id', 'email', 'phone', 'name_in_tournament'];

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
  const [errors, setErrors] = useState({});
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

    // Trước đây form này hoàn toàn dựa vào thuộc tính `required` của HTML, nên
    // email/CCCD/số điện thoại sai định dạng vẫn gửi lên và chỉ bị chặn ở backend.
    const newErrors = checkRequired(formData, REQUIRED_FIELDS);

    if (formData.personal_id && !isAlphaNum(formData.personal_id))
      newErrors.personal_id = 'CCCD/STTN chỉ được chứa chữ và số';
    else if (formData.personal_id && (formData.personal_id.length < 5 || formData.personal_id.length > 20))
      newErrors.personal_id = 'CCCD/STTN phải từ 5 đến 20 ký tự';

    if (formData.email && !isEmail(formData.email))
      newErrors.email = 'Email không hợp lệ';

    if (formData.phone && !isPhone(formData.phone))
      newErrors.phone = 'Số điện thoại không hợp lệ';

    if (formData.full_name && formData.full_name.trim().length < 2)
      newErrors.full_name = 'Họ tên phải từ 2 ký tự';

    if (formData.name_in_tournament && formData.name_in_tournament.trim().length < 2)
      newErrors.name_in_tournament = 'Tên trong giải đấu phải từ 2 ký tự';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
      console.error('[ERROR][RegisterUser]:', error);
      const { message, errors: fieldErrors } = getServerError(error, 'Đăng ký thất bại');
      setErrors(prev => ({ ...prev, ...fieldErrors }));
      alert('Đăng ký thất bại: ' + message);
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
              {errors.full_name && <p className="error-text">{errors.full_name}</p>}
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
              {errors.personal_id && <p className="error-text">{errors.personal_id}</p>}
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
              {errors.email && <p className="error-text">{errors.email}</p>}
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
              {errors.phone && <p className="error-text">{errors.phone}</p>}
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
              {errors.name_in_tournament && <p className="error-text">{errors.name_in_tournament}</p>}
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