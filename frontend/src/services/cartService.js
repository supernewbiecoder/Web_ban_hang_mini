import api from './api';

export const getCart = async () => {
  const res = await api.get('/cart');
  return res.data;
};

export const addToCart = async (item) => {
  const res = await api.put('/cart', item);
  return res.data;
};

export const updateCartItem = async (product_id, quantity) => {
  const res = await api.patch(`/cart/${encodeURIComponent(product_id)}`, { quantity });
  return res.data;
};

export const removeFromCart = async (product_id) => {
  const res = await api.delete(`/cart/${encodeURIComponent(product_id)}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete('/cart');
  return res.data;
};
