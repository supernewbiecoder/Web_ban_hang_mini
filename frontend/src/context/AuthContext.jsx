import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, login as loginApi, logout as logoutApi, register as registerApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  const login = async (username, password) => {
    await loginApi(username, password);
    setUser(getCurrentUser());
  };

  const register = async (username, password) => {
    await registerApi(username, password);
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    navigate('/login');
  };

  const value = useMemo(() => ({ user, login, logout, register }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
