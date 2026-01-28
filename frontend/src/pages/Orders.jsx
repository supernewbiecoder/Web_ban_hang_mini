import { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService';
import Loading from '../components/Loading';

export default function Orders() {
  const [data, setData] = useState({ orders: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;

  return (
    <div>
      <h2 className="section-title">Đơn hàng của tôi</h2>
      {data.orders.length === 0 ? (
        <div>Chưa có đơn hàng nào</div>
      ) : (
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))'}}>
          {data.orders.map((o) => (
            <div key={o.order_id} className="card" style={{ padding: 16 }}>
              <div><strong>Mã đơn:</strong> {o.order_id}</div>
              <div><strong>Trạng thái:</strong> {o.order_status}</div>
              <div><strong>Thanh toán:</strong> {o.payment_status}</div>
              <div><strong>Tổng tiền:</strong> {o.price?.toLocaleString()}đ</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
