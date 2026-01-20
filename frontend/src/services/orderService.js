import api from './api';

// Get all orders (User sees only their orders, Admin sees all)
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.order_id) params.append('order_id', filters.order_id);
    if (filters.order_status) params.append('order_status', filters.order_status);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    
    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Lấy danh sách đơn hàng thất bại' };
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Lấy thông tin đơn hàng thất bại' };
  }
};

// Create new order (User only)
export const createOrder = async (orderData) => {
  try {
    const response = await api.put('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Tạo đơn hàng thất bại' };
  }
};

// Update order status (Admin only)
export const updateOrder = async (id, updateData) => {
  try {
    const response = await api.post(`/orders/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Cập nhật đơn hàng thất bại' };
  }
};

// Delete order (Admin only)
export const deleteOrder = async (id) => {
  try {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Xóa đơn hàng thất bại' };
  }
};
