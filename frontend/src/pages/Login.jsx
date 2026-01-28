import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock } from 'react-icons/fi';

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
    <div style={{maxWidth:450,margin:'0 auto'}}>
      <div className="card" style={{padding:40}}>
        <h2 style={{margin:'0 0 8px',textAlign:'center',fontSize:28,color:'#1f2937'}}>Đăng nhập</h2>
        <p style={{margin:'0 0 32px',textAlign:'center',color:'#6b7280'}}>Chào mừng bạn trở lại!</p>
        <form onSubmit={onSubmit}>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151',fontSize:14}}>
              <FiUser style={{marginRight:6}}/>Tên đăng nhập
            </label>
            <input 
              className="input" 
              placeholder="Nhập tên đăng nhập" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151',fontSize:14}}>
              <FiLock style={{marginRight:6}}/>Mật khẩu
            </label>
            <input 
              className="input" 
              placeholder="Nhập mật khẩu" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div style={{ color: '#ef4444',background:'#fee2e2',padding:'12px 16px',borderRadius:8,marginBottom:16,fontSize:14,fontWeight:500 }}>{error}</div>}
          <button className="btn" type="submit" style={{width:'100%',padding:'12px',fontSize:16}}>Đăng nhập</button>
        </form>
        <div style={{ marginTop: 24,textAlign:'center',color:'#6b7280' }}>
          Chưa có tài khoản? <Link to="/register" style={{color:'#ee4d2d',fontWeight:600,textDecoration:'none'}}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
