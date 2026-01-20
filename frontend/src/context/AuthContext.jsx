import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await loginService(username, password);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.error || 'Đăng nhập thất bại' };
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
