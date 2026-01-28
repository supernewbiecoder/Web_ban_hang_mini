import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [data, setData] = useState({ products: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addItem } = useCart();

  const [searchParams] = useSearchParams();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      const name = searchParams.get('name');
      if (name) filters.name = name;
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

  if (loading) return <Loading text="Đang tải sản phẩm..." />;
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;

  return (
    <div>
      <h2 className="section-title">Sản phẩm</h2>
      <div className="grid">
        {data.products.map((p) => (
          <ProductCard
            key={p.code}
            product={p}
            onAdd={() => user ? addItem({ product_id: p.code, product_name: p.name, price: p.sell_price, quantity: 1 }) : null}
          />
        ))}
      </div>
    </div>
  );
}
