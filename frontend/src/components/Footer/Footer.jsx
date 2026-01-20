import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🛍️ Shop Online</h3>
          <p>Website bán hàng online uy tín, chất lượng</p>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/products">Sản phẩm</a></li>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="/policy">Chính sách</a></li>
            <li><a href="/shipping">Vận chuyển</a></li>
            <li><a href="/return">Đổi trả</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>📧 Email: support@shoponline.com</p>
          <p>📱 Hotline: 1900-xxxx</p>
          <p>📍 Địa chỉ: Hà Nội, Việt Nam</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Shop Online. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
