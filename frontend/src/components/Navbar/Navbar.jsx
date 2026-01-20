import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🛍️ Shop Online
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link to="/products" className="navbar-link">
              Sản phẩm
            </Link>
          </li>
          
          {isAuthenticated && !isAdmin() && (
            <li>
              <Link to="/orders" className="navbar-link">
                Đơn hàng
              </Link>
            </li>
          )}
          
          {isAdmin() && (
            <li>
              <Link to="/admin" className="navbar-link">
                Quản trị
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated && !isAdmin() && (
            <Link to="/cart" className="navbar-cart">
              <FaShoppingCart />
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="navbar-user">
              <FaUser />
              <span className="username">{user?.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
