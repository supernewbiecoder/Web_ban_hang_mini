import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, updateItem, removeItem, clear } = useCart();

  const items = cart.items || [];

  return (
    <div>
      <h2 className="section-title">Giỏ hàng</h2>
      {items.length === 0 ? (
        <div>Giỏ hàng trống</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style={{ textAlign: 'right' }}>Giá</th>
                <th style={{ textAlign: 'right' }}>Số lượng</th>
                <th style={{ textAlign: 'right' }}>Tạm tính</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.product_id}>
                  <td>{it.product_name}</td>
                  <td style={{ textAlign: 'right' }}>{it.price?.toLocaleString()}đ</td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number"
                      min={0}
                      value={it.quantity}
                      onChange={(e) => updateItem(it.product_id, Number(e.target.value))}
                      style={{ width: 72 }}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>{(it.price * it.quantity)?.toLocaleString()}đ</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => removeItem(it.product_id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Tổng cộng</td>
                <td style={{ textAlign: 'right' }}>{cart.total_price?.toLocaleString()}đ</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn outline" onClick={clear}>Xóa toàn bộ</button>
            <Link to="/checkout" className="btn">Thanh toán</Link>
          </div>
        </>
      )}
    </div>
  );
}
