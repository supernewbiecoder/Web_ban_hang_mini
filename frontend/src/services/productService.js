import api from './api';

export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.name) params.append('name', filters.name);
  if (filters.category) params.append('category', filters.category);
  if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
  if (filters.min_price) params.append('min_price', filters.min_price);
  if (filters.max_price) params.append('max_price', filters.max_price);
  if (filters.status) params.append('status', filters.status);

  const query = params.toString();
  const url = query ? `/products?${query}` : '/products';
  const res = await api.get(url);
  return res.data;
};

// Only endpoints that exist in backend are used.
export const createProduct = async (productData) => {
  const res = await api.put('/products', productData);
  return res.data;
};

export const updateProduct = async (code, productData) => {
  const res = await api.patch(`/products/${code}`, productData);
  return res.data;
};

export const setProductActive = async (code) => {
  const res = await api.patch(`/products/active/${code}`);
  return res.data;
};

export const setProductInactive = async (code) => {
  const res = await api.patch(`/products/inactive/${code}`);
  return res.data;
};

export const deleteProduct = async (code) => {
  const res = await api.delete(`/products/${code}`);
  return res.data;
};
