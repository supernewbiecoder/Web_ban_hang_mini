import api from './api';

// Get all products with optional filters
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.name) params.append('name', filters.name);
    if (filters.category) params.append('category', filters.category);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Lấy danh sách sản phẩm thất bại' };
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Lấy thông tin sản phẩm thất bại' };
  }
};

// Create product (Admin only)
export const createProduct = async (productData) => {
  try {
    const response = await api.put('/products', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Tạo sản phẩm thất bại' };
  }
};

// Update product (Admin only)
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.post(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Cập nhật sản phẩm thất bại' };
  }
};

// Delete product (Admin only)
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Xóa sản phẩm thất bại' };
  }
};
