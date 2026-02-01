import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiPackage, FiShoppingCart, FiHome, FiTruck } from 'react-icons/fi';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  }

  return (
    <header className="header" style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container header-inner">
        <Link className="logo" to="/" style={{WebkitTextFillColor:'#fff',color:'#fff'}}>🔐 Admin Panel</Link>
        <nav className="nav-actions" style={{marginLeft:'auto'}}>
          <Link to="/" style={{color:'#fff',display:'flex',alignItems:'center',gap:6}}>
            <FiHome size={20}/>
            Home
          </Link>
          <Link to="/admin/products" style={{color:'#fff',display:'flex',alignItems:'center',gap:6}}>
            <FiPackage size={20}/>
            Sản phẩm
          </Link>
          <Link to="/admin/suppliers" style={{color:'#fff',display:'flex',alignItems:'center',gap:6}}>
            <FiTruck size={20}/>
            Nhà cung cấp
          </Link>
          <Link to="/orders" style={{color:'#fff',display:'flex',alignItems:'center',gap:6}}>
            <FiShoppingCart size={20}/>
            Đơn hàng
          </Link>
          <span style={{color:'#fff'}}>Hi, {user?.username}</span>
          <button 
            className="btn" 
            onClick={handleLogout} 
            title="Đăng xuất"
            style={{background:'rgba(255,255,255,.2)',color:'#fff',border:'1px solid rgba(255,255,255,.5)',display:'flex',alignItems:'center',gap:6}}
          >
            <FiLogOut/>
            Đăng xuất
          </button>
        </nav>
      </div>
    </header>
  );
}
