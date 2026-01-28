import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #eee' }}>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/products">Products</NavLink>
      {user && <NavLink to="/orders">Orders</NavLink>}
      <NavLink to="/cart">Cart ({cart.total_items || 0})</NavLink>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>Hi, {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <span> / </span>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
