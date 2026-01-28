import api from './api';

export const register = async (username, password) => {
  const res = await api.post('/auth/register', { username, password });
  return res.data;
};

export const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  const { access_token } = res.data;
  if (access_token) {
    localStorage.setItem('token', access_token);
    try {
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const user = { username: payload.username, role: payload.role };
      localStorage.setItem('user', JSON.stringify(user));
    } catch {}
  }
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
