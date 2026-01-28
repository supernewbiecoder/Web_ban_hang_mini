import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';

export default function Checkout() {
  const { cart, clear } = useCart();
  const [form, setForm] = useState({ receiver_name: '', phone: '', full_address: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const items = (cart.items || []).map((it) => ({
        product_id: it.product_id,
        name: it.product_name,
        price: it.price,
        quantity: it.quantity,
      }));

      const orderPayload = {
        // user_id will be injected by backend from token
        items,
        total_amount: cart.total_price,
        shipping_address: {
          receiver_name: form.receiver_name,
          phone: form.phone,
          full_address: form.full_address,
        },
        payment_method: 'cod',
        note: '',
      };

      const res = await createOrder(orderPayload);
      setMessage('Đặt hàng thành công!');
      await clear();
    } catch (e) {
      setMessage(e?.error || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Thanh toán</h2>
      <form onSubmit={onSubmit} className="form" style={{maxWidth:520}}>
        <div className="row"><input className="input" placeholder="Họ tên người nhận" value={form.receiver_name} onChange={(e)=>setForm(f=>({...f,receiver_name:e.target.value}))} required/></div>
        <div className="row"><input className="input" placeholder="Số điện thoại" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} required/></div>
        <div className="row"><textarea className="input" placeholder="Địa chỉ đầy đủ" value={form.full_address} onChange={(e)=>setForm(f=>({...f,full_address:e.target.value}))} required/></div>
        <button className="btn" type="submit" disabled={loading || (cart.items || []).length === 0}>{loading ? 'Đang xử lý...' : 'Đặt hàng'}</button>
      </form>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}
