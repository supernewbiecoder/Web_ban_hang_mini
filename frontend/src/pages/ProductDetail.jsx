import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';

export default function ProductDetail() {
  const { productCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProducts({ code: productCode });
        const foundProduct = res.products?.find(p => p.code === productCode);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch (e) {
        setError(e?.error || 'Lỗi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productCode]);

  const handleAddToCart = async () => {
    if (!user) {
      setNotification('Vui lòng đăng nhập để mua hàng');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await addItem({
          product_id: product.code,
          product_name: product.name,
          price: product.sell_price,
          quantity: 1,
        });
      }
      setNotification(`✓ Đã thêm ${quantity} sản phẩm vào giỏ`);
      setQuantity(1);
      setTimeout(() => setNotification(''), 2000);
    } catch (e) {
      setNotification('Lỗi khi thêm vào giỏ');
      setTimeout(() => setNotification(''), 2000);
    }
  };

  if (loading) return <Loading text="Đang tải chi tiết sản phẩm..." />;
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;
  if (!product) return <div style={{ padding: 24 }}>Không tìm thấy sản phẩm</div>;

  const imageUrl = product.image_url || product.imageUrl || product.thumbnail || product.image;
  const profit = product.sell_price - product.import_price;
  const profitPercent = ((profit / product.import_price) * 100).toFixed(1);

  return (
    <div>
      {notification && (
        <div style={{
          background: notification.includes('✓') ? '#f0fdf4' : '#fef2f2',
          border: notification.includes('✓') ? '1px solid #bbf7d0' : '1px solid #fecaca',
          color: notification.includes('✓') ? '#15803d' : '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {notification}
        </div>
      )}

      <button
        onClick={() => navigate('/products')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#ee4d2d',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '24px',
          padding: 0
        }}
      >
        <FiArrowLeft size={18} />
        Quay lại
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Product Image */}
        <div className="card" style={{ padding: '16px' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                maxHeight: '500px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              background: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '48px'
            }}>
              📦
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: '900' }}>
            {product.name}
          </h1>

          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#ee4d2d' }}>
                {product.sell_price?.toLocaleString()}đ
              </span>
              <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                {product.import_price?.toLocaleString()}đ
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
              💰 Tiết kiệm: {profit?.toLocaleString()}đ ({profitPercent}%)
            </div>
          </div>

          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                Tình trạng kho
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: product.total_quantity > 0 ? '#10b981' : '#ef4444'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {product.total_quantity > 0
                    ? `Còn ${product.total_quantity} sản phẩm`
                    : 'Hết hàng'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                Danh mục
              </span>
              <div style={{ marginTop: '4px', fontSize: '14px' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#fef2f2',
                  color: '#be123c',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                  Mô tả sản phẩm
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#4b5563'
              }}>
                {product.description}
              </p>
            </div>
          )}

          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                Số lượng
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.total_quantity === 0}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: product.total_quantity === 0 ? 'not-allowed' : 'pointer',
                  opacity: product.total_quantity === 0 ? 0.5 : 1
                }}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.total_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(product.total_quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                disabled={product.total_quantity === 0}
                style={{
                  width: '60px',
                  height: '36px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  cursor: product.total_quantity === 0 ? 'not-allowed' : 'text',
                  opacity: product.total_quantity === 0 ? 0.5 : 1
                }}
              />
              <button
                onClick={() => setQuantity(Math.min(product.total_quantity, quantity + 1))}
                disabled={product.total_quantity === 0}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: product.total_quantity === 0 ? 'not-allowed' : 'pointer',
                  opacity: product.total_quantity === 0 ? 0.5 : 1
                }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.total_quantity === 0}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: product.total_quantity === 0 ? '#d1d5db' : 'linear-gradient(135deg, #ee4d2d 0%, #ff6b4a 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: product.total_quantity === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: product.total_quantity === 0 ? 0.6 : 1
            }}
          >
            <FiShoppingCart size={20} />
            {product.total_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>

          <div className="card" style={{ padding: '16px', marginTop: '16px', background: '#f3f4f6' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
              <strong>Mã sản phẩm:</strong> {product.code}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              <strong>Nhà cung cấp:</strong> {product.supplier_id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
