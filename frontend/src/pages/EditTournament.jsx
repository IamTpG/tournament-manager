import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateTournament.module.css'; // Sử dụng lại CSS từ CreateTournamentPage

function EditTournamentPage() {
  const { id } = useParams(); // Lấy ID của giải đấu từ URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    format: '', // Thêm format
    participants: '', // Thêm participants
    start_date: '',
    end_date: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        // Kích hoạt việc gọi API để lấy dữ liệu giải đấu hiện có
        const res = await axios.get(`http://localhost:5000/api/admin/tournament/${id}`);
        const tournamentData = res.data;

        // Cập nhật formData với dữ liệu từ API
        setFormData({
          title: tournamentData.title || '',
          description: tournamentData.description || '',
          game: tournamentData.game || '',
          format: tournamentData.format || '',
          participants: tournamentData.participants || '',
          // Định dạng ngày tháng cho input type="date" (YYYY-MM-DD)
          start_date: tournamentData.start_date ? new Date(tournamentData.start_date) : '',
          end_date: tournamentData.end_date ? new Date(tournamentData.end_date) : '',
          image: tournamentData.image || '',
        });
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu giải đấu:", err);
        setError("Không thể tải thông tin giải đấu.");
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwtToken');

      // Gọi API để cập nhật giải đấu
      await axios.put(`http://localhost:5000/api/admin/tournament/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('Thông tin giải đấu đã được cập nhật!');
      navigate(`/tournament/${id}`); // Chuyển hướng về trang chi tiết giải đấu sau khi lưu
    } catch (err) {
      console.error("Lỗi khi cập nhật giải đấu:", err);
      alert('Cập nhật giải đấu thất bại!');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giải đấu này không?')) {
      try {
        const token = localStorage.getItem('jwtToken');
        
        // Gọi API để xóa giải đấu
        await axios.delete(`http://localhost:5000/api/admin/tournament/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert('Giải đấu đã được xóa thành công!');
        navigate('/tournaments'); // Chuyển hướng về trang quản lý giải đấu sau khi xóa
      } catch (err) {
        console.error("Lỗi khi xóa giải đấu:", err);
        alert('Xóa giải đấu thất bại!');
      }
    }
  };

  const handleCancel = () => {
    navigate(`/tournament/${id}`); // Quay lại trang chi tiết giải đấu
  };

  if (loading) return <div className={styles["create-page"]}>Đang tải...</div>;
  if (error) return <div className={styles["create-page"]}>{error}</div>;

  return (
    <div className={styles["create-page"]}>
      <div className={styles["create-container"]}>
        <h2 className={styles["create-title"]}>Chỉnh sửa giải đấu</h2>
        <form onSubmit={handleSave} className={styles["create-form"]}>
          <div>
            <label>Tên giải đấu:</label>
            <input
              name="title"
              placeholder="Nhập tên giải đấu"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Mô tả:</label>
            <input
              name="description"
              placeholder="Nhập mô tả"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Game:</label>
            <select name="game" value={formData.game} onChange={handleChange}>
              <option value="">Chọn game</option>
              <option value="PUBG">PUBG</option>
              <option value="Valorant">Valorant</option>
              <option value="Chess">Chess</option>
            </select>
          </div>

          <div>
            <label>Loại hình:</label>
            <select name="format" value={formData.format} onChange={handleChange}>
              <option value="">Chọn loại hình</option>
              <option value="Loại trực tiếp">Loại trực tiếp</option>
              <option value="Loại lần 2">Loại lần 2</option>
              <option value="Xếp hạng">Xếp hạng</option>
            </select>
          </div>

          <div>
            <label>Số lượng người tham gia:</label>
            <input
              name="participants"
              placeholder="Nhập số lượng người tham gia"
              value={formData.participants}
              onChange={handleChange}
            />
          </div>

          <div className={styles["date-grid"]}>
            <div>
              <label>Thời gian bắt đầu:</label>
              <input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Thời gian kết thúc:</label>
              <input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label>Ảnh bìa giải đấu (URL):</label>
            <input
              name="image"
              placeholder="Dán URL ảnh"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          <div className={styles["create-buttons"]}>
            <button type="submit" className={styles["submit-btn"]}>
              Lưu
            </button>
            <button type="button" className={styles["cancel-btn"]} onClick={handleCancel}>
              Hủy
            </button>
            <button type="button" className={styles["delete-btn"]} onClick={handleDelete}>
              Xóa giải đấu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTournamentPage;
