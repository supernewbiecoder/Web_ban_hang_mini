import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>🛍️ Chào mừng đến Shop Online</h1>
          <p>Nơi mua sắm trực tuyến uy tín, chất lượng với giá tốt nhất</p>
          <Link to="/products" className="btn-hero">
            Xem sản phẩm ngay
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>Tại sao chọn chúng tôi?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Sản phẩm chất lượng</h3>
            <p>Cam kết 100% hàng chính hãng, chất lượng cao</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Giao hàng nhanh</h3>
            <p>Giao hàng toàn quốc, nhanh chóng, an toàn</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Giá cả hợp lý</h3>
            <p>Giá tốt nhất thị trường, nhiều ưu đãi hấp dẫn</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Đổi trả dễ dàng</h3>
            <p>Chính sách đổi trả linh hoạt trong 7 ngày</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Thanh toán đa dạng</h3>
            <p>Hỗ trợ nhiều hình thức thanh toán tiện lợi</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Hỗ trợ 24/7</h3>
            <p>Đội ngũ tư vấn sẵn sàng hỗ trợ mọi lúc</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Bắt đầu mua sắm ngay hôm nay!</h2>
        <p>Đăng ký tài khoản để nhận nhiều ưu đãi hấp dẫn</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn-cta primary">
            Đăng ký ngay
          </Link>
          <Link to="/products" className="btn-cta secondary">
            Khám phá sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
