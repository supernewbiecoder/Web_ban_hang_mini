import React, { useState, useEffect } from 'react';
import { getOrders } from '../../services/orderService';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      processing: 'status-processing',
      confirmed: 'status-confirmed',
      shipping: 'status-shipping',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      processing: 'Đang xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      pending: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      cod: 'Thanh toán khi nhận hàng',
      banking: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo',
      vnpay: 'VNPay',
    };
    return methodMap[method] || method;
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.order_status === filter;
  });

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="order-history-container">
      <h1>Lịch sử đơn hàng</h1>

      <div className="order-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả ({orders.length})
        </button>
        <button
          className={filter === 'processing' ? 'active' : ''}
          onClick={() => setFilter('processing')}
        >
          Đang xử lý
        </button>
        <button
          className={filter === 'confirmed' ? 'active' : ''}
          onClick={() => setFilter('confirmed')}
        >
          Đã xác nhận
        </button>
        <button
          className={filter === 'shipping' ? 'active' : ''}
          onClick={() => setFilter('shipping')}
        >
          Đang giao
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Hoàn thành
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Đã hủy
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Mã đơn:</strong> {order.order_id}
                </div>
                <div className="order-date">{formatDate(order.created_at)}</div>
              </div>

              <div className="order-status-row">
                <span className={`status-badge ${getStatusBadgeClass(order.order_status)}`}>
                  {getStatusText(order.order_status)}
                </span>
                <span className="payment-status">
                  {getPaymentStatusText(order.payment_status)}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">
                      {item.name} × {item.quantity} {item.unit}
                    </span>
                    <span className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span>Phương thức thanh toán:</span>
                  <span>{getPaymentMethodText(order.payment_method)}</span>
                </div>
                {order.shipping_address && (
                  <div className="info-row">
                    <span>Địa chỉ giao hàng:</span>
                    <span>
                      {order.shipping_address.receiver_name} - {order.shipping_address.phone}
                      <br />
                      {order.shipping_address.full_address}
                    </span>
                  </div>
                )}
                {order.note && (
                  <div className="info-row">
                    <span>Ghi chú:</span>
                    <span>{order.note}</span>
                  </div>
                )}
              </div>

              <div className="order-total">
                <strong>Tổng tiền:</strong>
                <span className="total-amount">
                  {formatPrice(calculateOrderTotal(order.items))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
