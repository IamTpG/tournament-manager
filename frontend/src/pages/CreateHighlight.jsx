import { useState } from 'react';
import axios from 'axios';
import styles from './CreateTournament.module.css';
import { isUrl, checkRequired, getServerError } from '../utils/validation';

const REQUIRED_FIELDS = ['title', 'description', 'image', 'URL'];

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
    const newErrors = checkRequired(formData, REQUIRED_FIELDS);

    if (formData.image && !isUrl(formData.image))
      newErrors.image = "Ảnh phải là đường dẫn http(s) hợp lệ";

    if (formData.URL && !isUrl(formData.URL))
      newErrors.URL = "Link video phải là đường dẫn http(s) hợp lệ";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const token = localStorage.getItem('jwtToken');

        await axios.post('http://localhost:5000/api/admin/highlight', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('Tạo highlight thành công!');
      } catch (err) {
        console.error(err);
        const { message, errors: fieldErrors } = getServerError(err, 'Tạo highlight thất bại');
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        alert(message);
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
