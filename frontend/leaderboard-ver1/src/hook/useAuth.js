// useAuth.js
import { useState, useEffect } from 'react';
import api from '../services/api'; // Импортируем api.js

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Локальная авторизация через API
  const loginWithData = async (userData) => {
    try {
      console.log('Logging in with data:', userData);
      const response = await api.post('/auth/test-login', userData); // Используем api.js

      if (response.status === 200) {
        const userInfo = response.data;
        setUser(userInfo);
        console.log('Login successful:', userInfo);
        return true;
      } else {
        console.error('Login failed:', response.status);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await api.post('/auth/logout'); // Используем api.js
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      console.log('Logged out');
    }
  };

  const checkAuth = async () => {
    try {
      console.log('Checking auth...');
      const response = await api.get('/auth/me'); // Используем api.js
      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        console.log('User is authenticated:', userData);
      } else {
        console.log('User is not authenticated');
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    loginWithData,
    logout,
    checkAuth
  };
};