import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import { FiFilter } from 'react-icons/fi';

const CATEGORIES = ['Thực phẩm', 'Quần áo', 'Điện tử', 'Đồ gia dụng', 'Dụng cụ bếp'];

export default function ProductList() {
  const [data, setData] = useState({ products: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addItem } = useCart();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      const name = searchParams.get('name');
      const category = searchParams.get('category');
      if (name) filters.name = name;
      if (category) filters.category = category;
      const res = await getProducts(filters);
      setData({ products: res.products || [], count: res.count || 0 });
    } catch (e) {
      setError(e?.error || 'Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    navigate(`/products?${params.toString()}`);
  };

  const selectedCategory = searchParams.get('category');

  if (loading) return <Loading text="Đang tải sản phẩm..." />;
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;

  return (
    <div>
      <h2 className="section-title">Sản phẩm</h2>
      
      {/* Category Filter */}
      <div className="card" style={{marginBottom:24,padding:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <FiFilter size={20} style={{color:'#ee4d2d'}}/>
          <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Danh mục</h3>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button
            onClick={() => handleCategoryChange('')}
            className="btn"
            style={{
              background:!selectedCategory ? 'linear-gradient(135deg, #ee4d2d 0%, #ff6b4a 100%)' : '#f3f4f6',
              color:!selectedCategory ? '#fff' : '#1f2937',
              padding:'8px 16px',
              fontSize:14
            }}
          >
            Tất cả
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className="btn"
              style={{
                background:selectedCategory === cat ? 'linear-gradient(135deg, #ee4d2d 0%, #ff6b4a 100%)' : '#f3f4f6',
                color:selectedCategory === cat ? '#fff' : '#1f2937',
                padding:'8px 16px',
                fontSize:14
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid">
        {data.products.length > 0 ? (
          data.products.map((p) => (
            <ProductCard
              key={p.code}
              product={p}
              onAdd={() => user ? addItem({ product_id: p.code, product_name: p.name, price: p.sell_price, quantity: 1 }) : null}
            />
          ))
        ) : (
          <div style={{gridColumn:'1 / -1',textAlign:'center',padding:40}}>
            <p style={{color:'#6b7280',fontSize:16}}>Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
