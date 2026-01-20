import api from './api';

// Register new user
export const register = async (username, password) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Đăng ký thất bại' };
  }
};

// Login user
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    
    if (response.data.access_token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.access_token);
      
      // Decode token to get user info (simple decode, not verification)
      const tokenParts = response.data.access_token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const user = {
          username: payload.username,
          role: payload.role,
        };
        localStorage.setItem('user', JSON.stringify(user));
        return { token: response.data.access_token, user };
      }
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Đăng nhập thất bại' };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
