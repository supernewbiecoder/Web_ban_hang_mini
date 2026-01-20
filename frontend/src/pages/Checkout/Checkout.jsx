import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    receiver_name: '',
    phone: '',
    full_address: '',
    payment_method: 'cod',
    note: '',
  });

  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.receiver_name || !formData.phone || !formData.full_address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    const orderData = {
      user_id: user.username,
      items: cartItems.map((item) => ({
        product_id: item.code || item._id,
        name: item.name,
        price: item.sell_price,
        quantity: item.quantity,
        unit: item.unit,
      })),
      total_amount: getCartTotal(),
      shipping_address: {
        receiver_name: formData.receiver_name,
        phone: formData.phone,
        full_address: formData.full_address,
      },
      payment_method: formData.payment_method,
      note: formData.note,
    };

    setLoading(true);
    try {
      const result = await createOrder(orderData);
      toast.success('Đặt hàng thành công!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast.error(error.error || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-container">
      <h1>Thanh toán</h1>

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Thông tin giao hàng</h2>
              
              <div className="form-group">
                <label htmlFor="receiver_name">Họ tên người nhận *</label>
                <input
                  type="text"
                  id="receiver_name"
                  name="receiver_name"
                  value={formData.receiver_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  pattern="[0-9]{10,11}"
                  placeholder="0987654321"
                />
              </div>

              <div className="form-group">
                <label htmlFor="full_address">Địa chỉ giao hàng *</label>
                <textarea
                  id="full_address"
                  name="full_address"
                  value={formData.full_address}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows="3"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Phương thức thanh toán</h2>
              
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formData.payment_method === 'cod'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>💵 Thanh toán khi nhận hàng (COD)</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="banking"
                    checked={formData.payment_method === 'banking'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>🏦 Chuyển khoản ngân hàng</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="momo"
                    checked={formData.payment_method === 'momo'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>📱 Ví MoMo</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment_method"
                    value="vnpay"
                    checked={formData.payment_method === 'vnpay'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>💳 VNPay</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Ghi chú đơn hàng</h2>
              
              <div className="form-group">
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  disabled={loading}
                  rows="3"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn..."
                />
              </div>
            </div>

            <button type="submit" className="btn-place-order" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Đơn hàng của bạn</h2>
          
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item._id} className="summary-item">
                <span className="item-name">
                  {item.name} × {item.quantity}
                </span>
                <span className="item-price">
                  {formatPrice(item.sell_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <span>Tổng cộng:</span>
            <span className="total-amount">{formatPrice(getCartTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
