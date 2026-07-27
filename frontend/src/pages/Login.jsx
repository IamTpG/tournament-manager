import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css'; // Import as object
import { getServerError } from '../utils/validation';

function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const token = res.data.token;

      localStorage.setItem('jwtToken', token); // Save JWT
      navigate('/');
      window.location.reload(true); 
      alert('Đăng nhập thành công!');
    } catch (err) {
      console.error(err);
      // Chỉ coi là sai thông tin đăng nhập khi server thực sự trả 401. Bản cũ
      // báo "sai tài khoản/mật khẩu" cho cả lỗi mạng lẫn lỗi 500.
      if (err.response?.status === 401) {
        setError('Tài khoản hoặc mật khẩu không đúng.');
      } else {
        setError(getServerError(err, 'Không thể đăng nhập. Vui lòng thử lại.').message);
      }
    }
  };

  return (
    <div className={styles["login-container"]}>
      <form onSubmit={handleSubmit} className={styles["login-form"]}>
        <h2>Đăng nhập</h2>
        <input
          type="text"
          name="username"
          placeholder="Tài khoản"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {error && <p className={styles["error"]}>{error}</p>}
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}

export default LoginPage;

