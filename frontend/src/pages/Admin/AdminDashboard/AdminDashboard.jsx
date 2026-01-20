import React, { useState, useEffect } from 'react';
import { getProducts, updateProduct, deleteProduct } from '../../../services/productService';
import { getOrders, updateOrder } from '../../../services/orderService';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading/Loading';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { order_status: newStatus });
      toast.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
      setEditingOrder(null);
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleToggleProductStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await updateProduct(product._id, { status: newStatus });
      toast.success('Cập nhật trạng thái sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await deleteProduct(productId);
      toast.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại');
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

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="admin-dashboard">
      <h1>🔧 Quản trị viên</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          📦 Sản phẩm
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          📋 Đơn hàng
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 Thống kê
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {activeTab === 'products' && (
            <div className="admin-section">
              <h2>Quản lý sản phẩm</h2>
              
              {products.length === 0 ? (
                <p className="no-data">Không có sản phẩm nào</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã SP</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>{product.code}</td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{formatPrice(product.sell_price)}</td>
                          <td>{product.total_quantity}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                product.status === 'active' ? 'status-active' : 'status-inactive'
                              }`}
                            >
                              {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                            </span>
                          </td>
                          <td className="action-buttons">
                            <button
                              className="btn-toggle"
                              onClick={() => handleToggleProductStatus(product)}
                            >
                              {product.status === 'active' ? 'Tắt' : 'Bật'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-section">
              <h2>Quản lý đơn hàng</h2>
              
              {orders.length === 0 ? (
                <p className="no-data">Không có đơn hàng nào</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày đặt</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.order_id}</td>
                          <td>{order.customer_id}</td>
                          <td>{formatPrice(calculateOrderTotal(order.items))}</td>
                          <td>
                            {editingOrder === order._id ? (
                              <select
                                value={order.order_status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order._id, e.target.value)
                                }
                                className="status-select"
                              >
                                <option value="processing">Đang xử lý</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="shipping">Đang giao hàng</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            ) : (
                              <span className="status-text">
                                {getStatusText(order.order_status)}
                              </span>
                            )}
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                          <td className="action-buttons">
                            {editingOrder === order._id ? (
                              <button
                                className="btn-cancel"
                                onClick={() => setEditingOrder(null)}
                              >
                                Hủy
                              </button>
                            ) : (
                              <button
                                className="btn-edit"
                                onClick={() => setEditingOrder(order._id)}
                              >
                                Sửa
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="admin-section">
              <h2>Thống kê</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Tổng sản phẩm</h3>
                  <p className="stat-number">{products.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Tổng đơn hàng</h3>
                  <p className="stat-number">{orders.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Đơn đang xử lý</h3>
                  <p className="stat-number">
                    {orders.filter((o) => o.order_status === 'processing').length}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Đơn hoàn thành</h3>
                  <p className="stat-number">
                    {orders.filter((o) => o.order_status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
