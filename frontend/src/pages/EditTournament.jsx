import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateTournament.module.css'; // Sử dụng lại CSS từ CreateTournamentPage
import { isPositiveInt, isUrl, checkRequired, getServerError } from '../utils/validation';
import { toDateInputValue } from '../utils/date';

// Cùng bộ quy tắc với trang tạo mới — trước đây trang sửa không kiểm tra gì cả,
// nên mọi ràng buộc ở trang tạo đều có thể lách qua bằng cách vào sửa.
const REQUIRED_FIELDS = [
  'title', 'description', 'game', 'format',
  'participants', 'start_date', 'end_date', 'image'
];

const MAX_PARTICIPANTS = 1024; // khớp với giới hạn phía backend

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
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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
          // Định dạng ngày tháng cho input type="date" (YYYY-MM-DD).
          // Bản cũ gán thẳng đối tượng Date vào value nên ô chọn ngày luôn trống
          // và người dùng vô tình lưu lại giá trị rỗng.
          start_date: toDateInputValue(tournamentData.start_date),
          end_date: toDateInputValue(tournamentData.end_date),
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

    const newErrors = checkRequired(formData, REQUIRED_FIELDS);

    if (formData.participants) {
      if (!isPositiveInt(formData.participants))
        newErrors.participants = "Chỉ được nhập số nguyên dương";
      else if (parseInt(formData.participants) < 2)
        newErrors.participants = "Số người tham gia ít nhất là 2";
      else if (parseInt(formData.participants) > MAX_PARTICIPANTS)
        newErrors.participants = `Số người tham gia tối đa là ${MAX_PARTICIPANTS}`;
    }

    if (formData.image && !isUrl(formData.image))
      newErrors.image = "Ảnh phải là đường dẫn http(s) hợp lệ";

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
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
      const { message, errors: fieldErrors } = getServerError(err, 'Cập nhật giải đấu thất bại!');
      setErrors(prev => ({ ...prev, ...fieldErrors }));
      alert(message);
    } finally {
      setSaving(false);
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
        alert(getServerError(err, 'Xóa giải đấu thất bại!').message);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/tournament/${id}`); // Quay lại trang chi tiết giải đấu
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

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
            {errors.title && <p className={styles["error-text"]}>{errors.title}</p>}
          </div>

          <div>
            <label>Mô tả:</label>
            <input
              name="description"
              placeholder="Nhập mô tả"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className={styles["error-text"]}>{errors.description}</p>}
          </div>

          <div>
            <label>Game:</label>
            <select name="game" value={formData.game} onChange={handleChange}>
              <option value="">Chọn game</option>
              <option value="PUBG">PUBG</option>
              <option value="Street Fighter">Street Fighter</option>
              <option value="Chess">Chess</option>
            </select>
            {errors.game && <p className={styles["error-text"]}>{errors.game}</p>}
          </div>

          <div>
            <label>Loại hình:</label>
            <select name="format" value={formData.format} onChange={handleChange}>
              <option value="">Chọn loại hình</option>
              <option value="Loại trực tiếp">Loại trực tiếp</option>
              <option value="Loại lần 2">Loại lần 2</option>
              <option value="Xếp hạng">Xếp hạng</option>
            </select>
            {errors.format && <p className={styles["error-text"]}>{errors.format}</p>}
          </div>

          <div>
            <label>Số lượng người tham gia:</label>
            <input
              name="participants"
              placeholder="Nhập số lượng người tham gia"
              value={formData.participants}
              onChange={handleChange}
            />
            {errors.participants && <p className={styles["error-text"]}>{errors.participants}</p>}
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
            {errors.start_date && <p className={styles["error-text"]}>{errors.start_date}</p>}
            </div>
            <div>
              <label>Thời gian kết thúc:</label>
              <input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
              />
            {errors.end_date && <p className={styles["error-text"]}>{errors.end_date}</p>}
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
            {errors.image && <p className={styles["error-text"]}>{errors.image}</p>}
          </div>

          <div className={styles["create-buttons"]}>
            <button type="submit" className={styles["submit-btn"]} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
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
