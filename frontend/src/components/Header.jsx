import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiSearch, FiLogOut, FiPackage } from 'react-icons/fi';

export default function Header(){
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get('name') || '');
  const count = useMemo(()=> Number(cart?.total_items||0),[cart]);

  const onSearch=(e)=>{
    e.preventDefault();
    const params = new URLSearchParams();
    if(q) params.set('name', q);
    navigate(`/products${params.toString() ? `?${params}`:''}`);
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link className="logo" to="/">MiniShop</Link>
        <nav className="nav-actions">
          <Link to="/products">Sản phẩm</Link>
          {user && <Link to="/orders" style={{display:'flex',alignItems:'center',gap:6}}><FiPackage size={18}/>Đơn hàng</Link>}
          <div className="badge">
            <Link to="/cart" title="Giỏ hàng"><FiShoppingCart size={22}/></Link>
            <span className="count">{count}</span>
          </div>
          {user ? (
            <>
              <span style={{color:'#6b7280'}}>Hi, {user.username}</span>
              <button className="btn outline" onClick={logout} title="Đăng xuất"><FiLogOut/></button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <span>/</span>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
