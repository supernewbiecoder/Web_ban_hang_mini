import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, onAdd, requireLogin }){
  const navigate = useNavigate();
  const imageUrl = product.image_url || product.imageUrl || product.thumbnail || product.image;
  
  const handleAddClick = (e) => {
    e.stopPropagation();
    if (requireLogin) {
      requireLogin();
    } else {
      onAdd();
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.code}`);
  };
  
  return (
    <div className="card product-card" onClick={handleCardClick} style={{cursor: 'pointer'}}>
      <div className="product-thumb">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span style={{color:'#bbb', fontSize:14, fontWeight:500}}>📦 No Image</span>
        )}
      </div>
      <div className="product-body">
        <h4 className="product-name" title={product.name}>{product.name}</h4>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div className="product-price">{product.sell_price?.toLocaleString()}đ</div>
          <small style={{color:'#10b981',fontWeight:600,fontSize:12}}>🟢 Còn: {product.total_quantity}</small>
        </div>
        <div className="product-actions">
          <button className="btn" onClick={handleAddClick}>
            <FiShoppingCart size={18} style={{marginRight:6}}/>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  )
}
