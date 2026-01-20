import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    min_price: '',
    max_price: '',
  });
  
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (customFilters = {}) => {
    setLoading(true);
    try {
      const data = await getProducts(customFilters);
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchFilters = {};
    if (filters.name) searchFilters.name = filters.name;
    if (filters.category) searchFilters.category = filters.category;
    if (filters.min_price) searchFilters.min_price = filters.min_price;
    if (filters.max_price) searchFilters.max_price = filters.max_price;
    
    fetchProducts(searchFilters);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    
    if (isAdmin()) {
      toast.warning('Admin không thể mua hàng');
      return;
    }
    
    addToCart(product, 1);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="product-list-container">
      <h1>Danh sách sản phẩm</h1>

      <div className="filter-section">
        <form onSubmit={handleSearch} className="filter-form">
          <input
            type="text"
            name="name"
            placeholder="Tìm theo tên sản phẩm..."
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Danh mục..."
            value={filters.category}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="min_price"
            placeholder="Giá tối thiểu"
            value={filters.min_price}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="max_price"
            placeholder="Giá tối đa"
            value={filters.max_price}
            onChange={handleFilterChange}
          />
          <button type="submit" className="btn-search">
            Tìm kiếm
          </button>
          <button
            type="button"
            className="btn-reset"
            onClick={() => {
              setFilters({ name: '', category: '', min_price: '', max_price: '' });
              fetchProducts();
            }}
          >
            Đặt lại
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={`https://via.placeholder.com/300x200?text=${encodeURIComponent(
                    product.name
                  )}`}
                  alt={product.name}
                />
                {product.status === 'inactive' && (
                  <span className="badge-inactive">Ngừng bán</span>
                )}
              </div>
              
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">{formatPrice(product.sell_price)}</p>
                
                <div className="product-details">
                  <span>Đơn vị: {product.unit}</span>
                  <span>Kho: {product.total_quantity}</span>
                </div>
                
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                
                <div className="product-actions">
                  {!isAdmin() && product.status === 'active' && (
                    <button
                      className="btn-add-cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.total_quantity === 0}
                    >
                      {product.total_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
