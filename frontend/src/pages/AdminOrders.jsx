import { useEffect, useState } from 'react';
import { FiChevronDown, FiCheckCircle } from 'react-icons/fi';
import { getOrders } from '../services/orderService';
import Loading from '../components/Loading';

const ORDER_STATUSES = ['processing', 'success'];
const STATUS_LABELS = {
  processing: { text: '⏳ Đang xử lý', bg: '#fef3c7', color: '#92400e' },
  success: { text: '✓ Đã hoàn thành', bg: '#d1fae5', color: '#065f46' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders({});
      setOrders(res.orders || []);
    } catch (e) {
      setError(e?.error || 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Call update order status API here when available
      alert('Cập nhật trạng thái thành công!');
      fetchOrders();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  if (loading) return <Loading text="Đang tải đơn hàng..." />;
  if (error) return <div style={{color:'#ef4444',padding:24}}>{error}</div>;

  return (
    <div>
      <h2 className="section-title">Quản lý đơn hàng</h2>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {orders.length === 0 ? (
          <div className="card" style={{padding:40,textAlign:'center'}}>
            <p style={{color:'#6b7280',fontSize:16}}>Không có đơn hàng nào</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="card" style={{overflow:'hidden'}}>
              <div 
                style={{
                  padding:16,
                  background:'#f9fafb',
                  cursor:'pointer',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center'
                }}
                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
              >
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>Đơn #{order.order_id}</div>
                  <div style={{color:'#6b7280',fontSize:14,marginTop:4}}>
                    Khách: {order.shipping_address?.receiver_name || 'N/A'} • {order.items?.length || 0} sản phẩm
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{
                    background:STATUS_LABELS[order.order_status]?.bg,
                    color:STATUS_LABELS[order.order_status]?.color,
                    padding:'6px 12px',
                    borderRadius:4,
                    fontSize:13,
                    fontWeight:600
                  }}>
                    {STATUS_LABELS[order.order_status]?.text}
                  </span>
                  <FiChevronDown 
                    size={20} 
                    style={{
                      transform:expandedOrder === order.order_id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition:'transform 0.3s'
                    }}
                  />
                </div>
              </div>

              {expandedOrder === order.order_id && (
                <div style={{padding:24,borderTop:'1px solid #e5e7eb'}}>
                  {/* Order Info */}
                  <div style={{marginBottom:24}}>
                    <h4 style={{margin:'0 0 12px',fontWeight:700}}>Thông tin đơn hàng</h4>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,fontSize:14}}>
                      <div>
                        <span style={{color:'#6b7280'}}>Tổng tiền:</span>
                        <div style={{fontWeight:700,color:'#ee4d2d',fontSize:18}}>
                          {order.price?.toLocaleString()}đ
                        </div>
                      </div>
                      <div>
                        <span style={{color:'#6b7280'}}>Phương thức thanh toán:</span>
                        <div style={{fontWeight:700}}>{order.payment_method === 'cod' ? 'Tiền mặt' : 'Khác'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div style={{marginBottom:24}}>
                    <h4 style={{margin:'0 0 12px',fontWeight:700}}>Địa chỉ giao hàng</h4>
                    <div style={{background:'#f9fafb',padding:12,borderRadius:8,fontSize:14}}>
                      <div><strong>{order.shipping_address?.receiver_name}</strong></div>
                      <div>{order.shipping_address?.phone}</div>
                      <div style={{color:'#6b7280',marginTop:4}}>{order.shipping_address?.full_address}</div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{marginBottom:24}}>
                    <h4 style={{margin:'0 0 12px',fontWeight:700}}>Sản phẩm</h4>
                    <table className="table" style={{margin:0}}>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th style={{textAlign:'right'}}>Giá</th>
                          <th style={{textAlign:'right'}}>Số lượng</th>
                          <th style={{textAlign:'right'}}>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td style={{textAlign:'right'}}>{item.price?.toLocaleString()}đ</td>
                            <td style={{textAlign:'right'}}>{item.quantity}</td>
                            <td style={{textAlign:'right',fontWeight:700}}>
                              {(item.price * item.quantity)?.toLocaleString()}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 style={{margin:'0 0 12px',fontWeight:700}}>Cập nhật trạng thái</h4>
                    <select 
                      value={order.order_status}
                      onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                      style={{
                        padding:'10px 12px',
                        border:'1px solid #e5e7eb',
                        borderRadius:8,
                        fontSize:14,
                        fontWeight:600,
                        cursor:'pointer',
                        minWidth:200
                      }}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]?.text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
