import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios.config';

const AuthContext = createContext(null);

// Test kullanıcıları
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Admin User'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'USER',
    name: 'Normal User'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Token'ın geçerliliğini kontrol et
          const response = await axios.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        // Token geçersizse kullanıcıyı çıkış yaptır
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Geçersiz kullanıcı adı veya şifre');
      }
      throw new Error('Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
