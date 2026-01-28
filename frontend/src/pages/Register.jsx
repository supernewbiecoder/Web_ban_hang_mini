import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await register(username, password);
      setMessage('Đăng ký thành công, vui lòng đăng nhập');
      setTimeout(() => navigate('/login'), 1000);
    } catch (e) {
      setError(e?.response?.data?.error || 'Đăng ký thất bại');
    }
  };

  return (
    <div>
      <h2 className="section-title">Đăng ký</h2>
      <form onSubmit={onSubmit} className="form">
        <div className="row"><input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="row"><input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn" type="submit">Đăng ký</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 12 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 8 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </div>
  );
}
