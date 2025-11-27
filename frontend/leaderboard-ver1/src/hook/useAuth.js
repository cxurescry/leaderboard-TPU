import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Локальная авторизация через API
  const loginWithData = async (userData) => {
    try {
      console.log('Logging in with data:', userData);
      const response = await fetch('http://localhost:8000/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const userInfo = await response.json();
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
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
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
      const response = await fetch('http://localhost:8000/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
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