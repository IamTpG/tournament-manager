import { useState } from 'react';
import axios from 'axios';
import styles from './CreateTournament.module.css';

function CreateNewsPage() {

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    link: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title)   newErrors.title = "Không được để trống";
    if (!formData.content) newErrors.content = "Không được để trống";
    if (!formData.image)   newErrors.image = "Không được để trống";
    if (!formData.link)    newErrors.link = "Không được để trống";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const token = localStorage.getItem('jwtToken');

        await axios.post('http://localhost:5000/api/admin/news', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('News created!');
      } catch (err) {
        console.error(err);
        alert('Failed to create news');
      }
    }
  };

  return (
    <div className={styles["create-page"]}>
      <div className={styles["create-container"]}>
        <h2 className={styles["create-title"]}>Tạo tin tức mới</h2>
        <form onSubmit={handleSubmit} className={styles["create-form"]}>
          <div>
            <label>Tiêu đề:</label>
            <input
              name="title"
              placeholder="Nhập tiêu đề tin tức"
              onChange={handleChange}
            />
            {errors.title && <p className={styles["error-text"]}>{errors.title}</p>}
          </div>

          <div>
            <label>Nội dung:</label>
            <input
              name="content"
              placeholder="Nhập nội dung tin tức"
              onChange={handleChange}
            />
            {errors.content && <p className={styles["error-text"]}>{errors.content}</p>}
          </div>

          <div>
            <label>Ảnh (URL):</label>
            <input
              name="image"
              placeholder="Dán URL ảnh"
              onChange={handleChange}
            />
            {errors.image && <p className={styles["error-text"]}>{errors.image}</p>}
          </div>

          <div>
            <label>Đường dẫn liên kết (URL):</label>
            <input
              name="link"
              placeholder="Dán URL liên kết"
              onChange={handleChange}
            />
            {errors.link && <p className={styles["error-text"]}>{errors.link}</p>}
          </div>

          <div className={styles["create-buttons"]}>
            <button type="submit" className={styles["submit-btn"]}>
              Tạo tin tức
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNewsPage;
