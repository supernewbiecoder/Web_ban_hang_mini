import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <FaShoppingCart size={80} />
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <button className="btn-continue" onClick={() => navigate('/products')}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Giỏ hàng của bạn</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={`https://via.placeholder.com/100?text=${encodeURIComponent(item.name)}`}
                alt={item.name}
              />
              
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-category">{item.category}</p>
                <p className="item-price">{formatPrice(item.sell_price)}</p>
              </div>

              <div className="item-quantity">
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.total_quantity}
                >
                  +
                </button>
              </div>

              <div className="item-total">
                <p>{formatPrice(item.sell_price * item.quantity)}</p>
              </div>

              <button
                className="btn-remove"
                onClick={() => removeFromCart(item._id)}
                title="Xóa sản phẩm"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Tổng đơn hàng</h2>
          
          <div className="summary-row">
            <span>Số lượng sản phẩm:</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>

          <div className="summary-row total">
            <span>Tổng tiền:</span>
            <span className="total-price">{formatPrice(getCartTotal())}</span>
          </div>

          <button className="btn-checkout" onClick={handleCheckout}>
            Tiến hành thanh toán
          </button>

          <button className="btn-clear" onClick={clearCart}>
            Xóa giỏ hàng
          </button>

          <button className="btn-continue-shopping" onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
