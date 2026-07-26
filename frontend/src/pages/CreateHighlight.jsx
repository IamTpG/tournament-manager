import { useState } from 'react';
import axios from 'axios';
import styles from './CreateTournament.module.css';

function CreateHighlightPage() {

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    URL: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title)       newErrors.title = "Không được để trống";
    if (!formData.description) newErrors.description = "Không được để trống";
    if (!formData.image)       newErrors.image = "Không được để trống";
    if (!formData.URL)         newErrors.URL = "Không được để trống";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const token = localStorage.getItem('jwtToken');

        await axios.post('http://localhost:5000/api/admin/highlight', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('Highlight created!');
      } catch (err) {
        console.error(err);
        alert('Failed to create highlight');
      }
    }
  };

  return (
    <div className={styles["create-page"]}>
      <div className={styles["create-container"]}>
        <h2 className={styles["create-title"]}>Tạo Highlight mới</h2>
        <form onSubmit={handleSubmit} className={styles["create-form"]}>
          <div>
            <label>Tiêu đề:</label>
            <input
              name="title"
              placeholder="Nhập tiêu đề highlight"
              onChange={handleChange}
            />
            {errors.title && <p className={styles["error-text"]}>{errors.title}</p>}
          </div>

          <div>
            <label>Mô tả:</label>
            <input
              name="description"
              placeholder="Nhập mô tả highlight"
              onChange={handleChange}
            />
            {errors.description && <p className={styles["error-text"]}>{errors.description}</p>}
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
            <label>Video (URL):</label>
            <input
              name="URL"
              placeholder="Dán URL video"
              onChange={handleChange}
            />
            {errors.URL && <p className={styles["error-text"]}>{errors.URL}</p>}
          </div>

          <div className={styles["create-buttons"]}>
            <button type="submit" className={styles["submit-btn"]}>
              Tạo Highlight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateHighlightPage;
