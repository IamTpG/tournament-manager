import { useState } from 'react';
import axios from 'axios';
import styles from './CreateTournament.module.css';
import { isUrl, checkRequired, getServerError } from '../utils/validation';

const REQUIRED_FIELDS = ['title', 'content', 'image', 'link'];

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
    const newErrors = checkRequired(formData, REQUIRED_FIELDS);

    if (formData.image && !isUrl(formData.image))
      newErrors.image = "Ảnh phải là đường dẫn http(s) hợp lệ";

    if (formData.link && !isUrl(formData.link))
      newErrors.link = "Đường dẫn liên kết phải là http(s) hợp lệ";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const token = localStorage.getItem('jwtToken');

        await axios.post('http://localhost:5000/api/admin/news', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('Tạo tin tức thành công!');
      } catch (err) {
        console.error(err);
        const { message, errors: fieldErrors } = getServerError(err, 'Tạo tin tức thất bại');
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        alert(message);
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
