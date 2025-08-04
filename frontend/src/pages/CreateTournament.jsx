import { useState } from 'react';
import axios from 'axios';
import styles from './CreateTournament.module.css';

function CreateTournamentPage() {

  const [formData, setFormData] = useState({
    id: '',
    game: '',
    title: '',
    format: '',
    description: '',
    participants: '',
    start_date: '',
    end_date: '',
    image: '',
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwtToken');

      await axios.post('http://localhost:5000/api/admin/tournament', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Tournament created!');
    } catch (err) {
      console.error(err);
      alert('Failed to create tournament');
    }
  };

  return (
    <div className={styles["create-page"]}>
      <div className={styles["create-container"]}>
        <h2 className={styles["create-title"]}>Tạo giải đấu mới</h2>
        <form onSubmit={handleSubmit} className={styles["create-form"]}>
          <div>
            <label>Mã giải đấu:</label>
            <input
              name="id"
              placeholder="Nhập mã giải đấu"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Tên giải đấu:</label>
            <input
              name="title"
              placeholder="Nhập tên giải đấu"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Mô tả:</label>
            <input
              name="description"
              placeholder="Nhập mô tả"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Game:</label>
            <select name="game" onChange={handleChange}>
              <option value="">Chọn game</option>
              <option value="PUBG">PUBG</option>
              <option value="Valorant">Valorant</option>
              <option value="Chess">Chess</option>
            </select>
          </div>

          <div>
            <label>Loại hình:</label>
            <select name="format" onChange={handleChange}>
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
              onChange={handleChange}
            />
          </div>

          <div className={styles["date-grid"]}>
            <div>
              <label>Thời gian bắt đầu:</label>
              <input
                name="start_date"
                type="date"
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Thời gian kết thúc:</label>
              <input
                name="end_date"
                type="date"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label>Ảnh bìa giải đấu (URL):</label>
            <input
              name="image"
              placeholder="Dán URL ảnh"
              onChange={handleChange}
            />
          </div>

          <div className={styles["create-buttons"]}>
            <button type="submit" className={styles["submit-btn"]}>
              Tạo giải đấu
            </button>
            <button type="button" className={styles["cancel-btn"]}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTournamentPage;
