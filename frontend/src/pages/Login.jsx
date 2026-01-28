import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <div>
      <h2 className="section-title">Đăng nhập</h2>
      <form onSubmit={onSubmit} className="form">
        <div className="row"><input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="row"><input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn" type="submit">Đăng nhập</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 8 }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </div>
    </div>
  );
}
