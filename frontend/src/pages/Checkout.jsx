import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function Checkout() {
  const { cart, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ receiver_name: '', phone: '', full_address: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const items = (cart.items || []).map((it) => ({
        product_id: it.product_id,
        name: it.product_name,
        price: it.price,
        quantity: it.quantity,
      }));

      const orderPayload = {
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
      setTimeout(() => navigate('/orders'), 2000);
    } catch (e) {
      console.error('Order error:', e);
      setError(e?.response?.data?.error || e?.error || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Thanh toán</h2>
      <div style={{maxWidth:520,margin:'0 auto'}}>
        <form onSubmit={onSubmit} className="form" style={{marginBottom:24}}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151',fontSize:14}}>
              Họ tên người nhận
            </label>
            <input 
              className="input" 
              placeholder="Nhập họ tên" 
              value={form.receiver_name} 
              onChange={(e)=>setForm(f=>({...f,receiver_name:e.target.value}))} 
              required
            />
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151',fontSize:14}}>
              Số điện thoại
            </label>
            <input 
              className="input" 
              placeholder="Nhập số điện thoại" 
              value={form.phone} 
              onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} 
              required
            />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151',fontSize:14}}>
              Địa chỉ đầy đủ
            </label>
            <textarea 
              className="input" 
              placeholder="Nhập địa chỉ giao hàng" 
              value={form.full_address} 
              onChange={(e)=>setForm(f=>({...f,full_address:e.target.value}))} 
              required
              rows="4"
            />
          </div>
          <button 
            className="btn" 
            type="submit" 
            disabled={loading || (cart.items || []).length === 0}
            style={{width:'100%',padding:'12px',fontSize:16}}
          >
            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
        </form>
        
        {message && (
          <div style={{
            background:'#d1fae5',
            color:'#065f46',
            padding:'16px',
            borderRadius:8,
            display:'flex',
            alignItems:'center',
            gap:12,
            marginBottom:16
          }}>
            <FiCheckCircle size={20}/>
            <div>{message}</div>
          </div>
        )}
        
        {error && (
          <div style={{
            background:'#fee2e2',
            color:'#991b1b',
            padding:'16px',
            borderRadius:8,
            display:'flex',
            alignItems:'center',
            gap:12
          }}>
            <FiAlertCircle size={20}/>
            <div>{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
