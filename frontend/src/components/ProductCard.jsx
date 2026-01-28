import { FiShoppingCart } from 'react-icons/fi';

export default function ProductCard({ product, onAdd }){
  return (
    <div className="card product-card">
      <div className="product-thumb">
        <span style={{color:'#bbb', fontSize:12}}>No Image</span>
      </div>
      <div className="product-body">
        <h4 className="product-name" title={product.name}>{product.name}</h4>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="product-price">{product.sell_price?.toLocaleString()}đ</div>
          <small style={{color:'#6b7280'}}>Còn: {product.total_quantity}</small>
        </div>
        <div className="product-actions">
          <button className="btn" onClick={onAdd}><FiShoppingCart style={{marginRight:6}}/>Thêm vào giỏ</button>
        </div>
      </div>
    </div>
  )
}
