import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('cf_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cf_token') || null);

  useEffect(() => {
    if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else       delete API.defaults.headers.common['Authorization'];
  }, [token]);

  const setAuth = (t, u) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('cf_token', t);
    localStorage.setItem('cf_user', JSON.stringify(u));
    API.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  };

  // Login step 1: password check → returns { requiresOTP, userId, devOTP }
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.requiresOTP) return data;
    setAuth(data.token, data.user);
    return data;
  };

  // Login step 2: OTP verify → sets auth
  const verifyLoginOTP = async (userId, otp) => {
    const { data } = await API.post('/auth/login/verify-otp', { userId, otp });
    setAuth(data.token, data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    localStorage.removeItem('fitlead_token');
    localStorage.removeItem('fitlead_user');
    delete API.defaults.headers.common['Authorization'];
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('cf_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, verifyLoginOTP, logout, updateUser, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
