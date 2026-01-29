import api from './api';

export const getOrders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.order_id) params.append('order_id', filters.order_id);
  if (filters.order_status) params.append('order_status', filters.order_status);
  if (filters.payment_status) params.append('payment_status', filters.payment_status);
  const query = params.toString();
  const url = query ? `/orders?${query}` : '/orders';
  const res = await api.get(url);
  return res.data;
};

export const createOrder = async (orderData) => {
  const res = await api.put('/orders', orderData);
  return res.data;
};

export const updateOrderStatus = async (orderId, statusData) => {
  const res = await api.patch(`/orders/${orderId}`, statusData);
  return res.data;
};
