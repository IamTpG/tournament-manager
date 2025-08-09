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

  const [errors, setErrors] = useState({});

  const isAlphaNum = (str) => {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      const isUpper = code >= 65 && code <= 90;  // A-Z
      const isLower = code >= 97 && code <= 122; // a-z
      const isDigit = code >= 48 && code <= 57;  // 0-9
      if (!isUpper && !isLower && !isDigit) return false;
    }
    return true;
  };

  const isPositive = (str) => {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (i == 0 && code == 48) return false;
      if (code < 48 || code > 57) return false;
    }
    return true;
  };

  // async function isImageAccessible(url) {
  //   try {
  //       const response = await fetch(url, { method: 'HEAD' }); // Chỉ lấy header, nhanh hơn
  //       return response.ok && response.headers.get("content-type")?.startsWith("image/");
  //   } catch {
  //       return false;
  //   }
  // }

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.id)            newErrors.id = "Không được để trống";
    if (!formData.game)          newErrors.game = "Không được để trống";
    if (!formData.title)         newErrors.title = "Không được để trống";
    if (!formData.format)        newErrors.format = "Không được để trống";
    if (!formData.description)   newErrors.description = "Không được để trống";
    if (!formData.participants)  newErrors.participants = "Không được để trống";
    if (!formData.start_date)    newErrors.start_date = "Không được để trống";
    if (!formData.end_date)      newErrors.end_date = "Không được để trống";
    if (!formData.image)         newErrors.image = "Không được để trống";

    if (formData.id && !isAlphaNum(formData.id))
        newErrors.id = "Chỉ được nhập chữ và số";

    if (formData.participants) {
      if (!isPositive(formData.participants))
        newErrors.participants = "Chỉ được nhập số nguyên dương";
      else if (parseInt(formData.participants) < 2)
        newErrors.participants = "Số người tham gia ít nhất là 2";
      else if (parseInt(formData.participants) > 1000000000)
        newErrors.participants = "Số người tham gia quá lớn";
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu";
      }
    }

    setErrors(newErrors);

    // if (formData.image) {
    //   (async () => {
    //       const ok = await isImageAccessible(formData.image);
    //       if (!ok)
    //         newErrors.image = "Ảnh không truy cập được hoặc URL sai";
    //   })();
    // }

    if (Object.keys(newErrors).length === 0) {
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
            {errors.id && <p style={{ color: "red" }}>{errors.id}</p>}
          </div>

          <div>
            <label>Tên giải đấu:</label>
            <input
              name="title"
              placeholder="Nhập tên giải đấu"
              onChange={handleChange}
            />
            {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}
          </div>

          <div>
            <label>Mô tả:</label>
            <input
              name="description"
              placeholder="Nhập mô tả"
              onChange={handleChange}
            />
            {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}
          </div>

          <div>
            <label>Game:</label>
            <select name="game" onChange={handleChange}>
              <option value="">Chọn game</option>
              <option value="PUBG">PUBG</option>
              <option value="Valorant">Valorant</option>
              <option value="Chess">Chess</option>
            </select>
            {errors.game && <p style={{ color: "red" }}>{errors.game}</p>}
          </div>

          <div>
            <label>Loại hình:</label>
            <select name="format" onChange={handleChange}>
              <option value="">Chọn loại hình</option>
              <option value="Loại trực tiếp">Loại trực tiếp</option>
              <option value="Loại lần 2">Loại lần 2</option>
              <option value="Xếp hạng">Xếp hạng</option>
            </select>
            {errors.format && <p style={{ color: "red" }}>{errors.format}</p>}
          </div>

          <div>
            <label>Số lượng người tham gia:</label>
            <input
              name="participants"
              placeholder="Nhập số lượng người tham gia"
              onChange={handleChange}
            />
            {errors.participants && <p style={{ color: "red" }}>{errors.participants}</p>}
          </div>

          <div>
            <label>Thời gian bắt đầu:</label>
            <input
              name="start_date"
              type="date"
              onChange={handleChange}
            />
            {errors.start_date && <p style={{ color: "red" }}>{errors.start_date}</p>}
          </div>

          <div>
            <label>Thời gian kết thúc:</label>
            <input
              name="end_date"
              type="date"
              onChange={handleChange}
              />
            {errors.end_date && <p style={{ color: "red" }}>{errors.end_date}</p>}
          </div>

          <div>
            <label>Ảnh bìa giải đấu (URL):</label>
            <input
              name="image"
              placeholder="Dán URL ảnh"
              onChange={handleChange}
            />
            {errors.image && <p style={{ color: "red" }}>{errors.image}</p>}
          </div>

          <div className={styles["create-buttons"]}>
            <button type="submit" className={styles["submit-btn"]}>
              Tạo giải đấu
            </button>
            {/* <button type="button" className={styles["cancel-btn"]}>
              Hủy
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTournamentPage;
