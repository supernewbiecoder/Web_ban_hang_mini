import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';

export default function Cart() {
  const { cart, updateItem, removeItem, clear } = useCart();

  const items = cart.items || [];

  return (
    <div>
      <h2 className="section-title">Giỏ hàng</h2>
      {items.length === 0 ? (
        <div className="card" style={{padding:60,textAlign:'center'}}>
          <FiShoppingCart size={64} style={{color:'#d1d5db',marginBottom:16}}/>
          <h3 style={{margin:'0 0 8px',color:'#6b7280'}}>Giỏ hàng trống</h3>
          <p style={{margin:'0 0 24px',color:'#9ca3af'}}>Hãy thêm sản phẩm vào giỏ hàng!</p>
          <Link to="/products" className="btn">Mua sắm ngay</Link>
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style={{ textAlign: 'right' }}>Giá</th>
                <th style={{ textAlign: 'right' }}>Số lượng</th>
                <th style={{ textAlign: 'right' }}>Tạm tính</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.product_id}>
                  <td style={{fontWeight:600}}>{it.product_name}</td>
                  <td style={{ textAlign: 'right',color:'#ee4d2d',fontWeight:700 }}>{it.price?.toLocaleString()}đ</td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      min={0}
                      value={it.quantity}
                      onChange={(e) => updateItem(it.product_id, Number(e.target.value))}
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ textAlign: 'right',color:'#ee4d2d',fontWeight:700,fontSize:16 }}>{(it.price * it.quantity)?.toLocaleString()}đ</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => removeItem(it.product_id)} title="Xóa sản phẩm">
                      <FiTrash2 size={16} style={{marginRight:4}}/>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{fontSize:18}}>Tổng cộng</td>
                <td style={{ textAlign: 'right',color:'#ee4d2d',fontSize:20 }}>{cart.total_price?.toLocaleString()}đ</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:16 }}>
            <button className="btn outline" onClick={clear} style={{display:'flex',alignItems:'center',gap:6}}>
              <FiTrash2/>
              Xóa toàn bộ
            </button>
            <Link to="/checkout" className="btn" style={{textDecoration:'none',fontSize:16,padding:'12px 32px'}}>
              Đặt hàng
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
