import { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService';
import { FiChevronDown, FiPackage, FiMapPin, FiCreditCard } from 'react-icons/fi';
import Loading from '../components/Loading';

const STATUS_LABELS = {
  processing: { text: '⏳ Đang xử lý', bg: '#fef3c7', color: '#92400e' },
  success: { text: '✓ Đã hoàn thành', bg: '#d1fae5', color: '#065f46' },
  cancelled: { text: '✗ Đã hủy', bg: '#fee2e2', color: '#991b1b' },
};

const PAYMENT_LABELS = {
  pending: { text: '⏳ Chưa thanh toán', bg: '#fef3c7', color: '#92400e' },
  completed: { text: '✓ Đã thanh toán', bg: '#d1fae5', color: '#065f46' },
};

export default function Orders() {
  const [data, setData] = useState({ orders: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOrders();
      setData({ orders: res.orders || [], count: res.count || 0 });
    } catch (e) {
      setError(e?.error || 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loading text="Đang tải đơn hàng..." />;
  if (error) return <div style={{ color: '#ef4444', padding: 24 }}>{error}</div>;

  const filteredOrders = data.orders.filter(order => 
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 className="section-title" style={{margin:0}}>(Đơn hàng của tôi</h2>
        <input
          type="text"
          placeholder="TÌm theo mã đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          style={{width:250}}
        />
      </div>
      {filteredOrders.length === 0 && searchTerm === '' ? (
        <div className="card" style={{padding:40,textAlign:'center'}}>
          <FiPackage size={48} style={{color:'#d1d5db',marginBottom:16}}/>
          <p style={{color:'#6b7280',fontSize:16,marginBottom:8}}>Bạn chưa có đơn hàng nào</p>
          <p style={{color:'#9ca3af',fontSize:14}}>Hãy đặt hàng ngay để theo dõi đơn hàng của bạn</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="card" style={{overflow:'hidden'}}>
              {/* Order Header */}
              <div 
                style={{
                  padding:16,
                  background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color:'#fff',
                  cursor:'pointer',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center'
                }}
                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
              >
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>Đơn hàng #{order.order_id}</div>
                  <div style={{opacity:0.9,fontSize:13,marginTop:4}}>
                    {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'N/A'}
                  </div>
                </div>
                <FiChevronDown 
                  size={24} 
                  style={{
                    transform:expandedOrder === order.order_id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition:'transform 0.3s'
                  }}
                />
              </div>

              {/* Order Summary */}
              <div style={{padding:16,background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
                  <div>
                    <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>Trạng thái đơn hàng</div>
                    <span style={{
                      background:STATUS_LABELS[order.order_status]?.bg || '#f3f4f6',
                      color:STATUS_LABELS[order.order_status]?.color || '#374151',
                      padding:'4px 12px',
                      borderRadius:4,
                      fontSize:13,
                      fontWeight:600,
                      display:'inline-block'
                    }}>
                      {STATUS_LABELS[order.order_status]?.text || order.order_status}
                    </span>
                  </div>
                  <div>
                    <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>Thanh toán</div>
                    <span style={{
                      background:PAYMENT_LABELS[order.payment_status]?.bg || '#f3f4f6',
                      color:PAYMENT_LABELS[order.payment_status]?.color || '#374151',
                      padding:'4px 12px',
                      borderRadius:4,
                      fontSize:13,
                      fontWeight:600,
                      display:'inline-block'
                    }}>
                      {PAYMENT_LABELS[order.payment_status]?.text || order.payment_status}
                    </span>
                  </div>
                  <div>
                    <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>Tổng tiền</div>
                    <div style={{fontSize:18,fontWeight:700,color:'#ee4d2d'}}>
                      {order.price?.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {expandedOrder === order.order_id && (
                <div style={{padding:24}}>
                  {/* Shipping Address */}
                  <div style={{marginBottom:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                      <FiMapPin size={20} style={{color:'#667eea'}}/>
                      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Địa chỉ giao hàng</h3>
                    </div>
                    <div className="card" style={{background:'#f9fafb',padding:16}}>
                      <div style={{fontWeight:600,marginBottom:8}}>
                        {order.shipping_address?.receiver_name || 'N/A'}
                      </div>
                      <div style={{color:'#6b7280',fontSize:14,marginBottom:4}}>
                        📞 {order.shipping_address?.phone || 'N/A'}
                      </div>
                      <div style={{color:'#6b7280',fontSize:14}}>
                        📍 {order.shipping_address?.address || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{marginBottom:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                      <FiCreditCard size={20} style={{color:'#667eea'}}/>
                      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Phương thức thanh toán</h3>
                    </div>
                    <div className="card" style={{background:'#f9fafb',padding:16}}>
                      <div style={{fontWeight:600}}>
                        {order.payment_method === 'cod' ? '💵 Thanh toán khi nhận hàng (COD)' : order.payment_method}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                      <FiPackage size={20} style={{color:'#667eea'}}/>
                      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Sản phẩm ({order.items?.length || 0})</h3>
                    </div>
                    <div className="card" style={{padding:0,overflow:'auto'}}>
                      <table className="table" style={{margin:0}}>
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th style={{textAlign:'right'}}>Đơn giá</th>
                            <th style={{textAlign:'center'}}>Số lượng</th>
                            <th style={{textAlign:'right'}}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(order.items || []).map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <div style={{fontWeight:600}}>{item.name}</div>
                                <div style={{fontSize:12,color:'#6b7280'}}>Mã: {item.product_id}</div>
                              </td>
                              <td style={{textAlign:'right',color:'#ee4d2d',fontWeight:600}}>
                                {item.price?.toLocaleString()}đ
                              </td>
                              <td style={{textAlign:'center'}}>
                                <span style={{
                                  background:'#f3f4f6',
                                  padding:'4px 12px',
                                  borderRadius:4,
                                  fontWeight:600
                                }}>
                                  {item.quantity}
                                </span>
                              </td>
                              <td style={{textAlign:'right',fontWeight:700,color:'#ee4d2d'}}>
                                {(item.price * item.quantity).toLocaleString()}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{background:'#f9fafb'}}>
                            <td colSpan="3" style={{textAlign:'right',fontWeight:700,fontSize:16}}>
                              Tổng cộng:
                            </td>
                            <td style={{textAlign:'right',fontWeight:700,fontSize:18,color:'#ee4d2d'}}>
                              {order.price?.toLocaleString()}đ
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Note if exists */}
                  {order.note && (
                    <div style={{marginTop:16,padding:12,background:'#fef3c7',borderLeft:'4px solid #f59e0b',borderRadius:4}}>
                      <div style={{fontWeight:600,fontSize:14,color:'#92400e',marginBottom:4}}>📝 Ghi chú:</div>
                      <div style={{fontSize:14,color:'#78350f'}}>{order.note}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
