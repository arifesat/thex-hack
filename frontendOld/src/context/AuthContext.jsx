import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data); // Debug için
      
      const { token } = response.data;
      if (!token) {
        throw new Error('Token alınamadı');
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', token);
      
      // Kullanıcı bilgilerini al
      const userResponse = await axios.get(`/api/auth/debug/user/${email}`);
      console.log('User response:', userResponse.data); // Debug için
      
      const userData = { 
        ...userResponse.data, 
        token,
        email
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error.response || error); // Debug için
      if (error.response?.status === 401) {
        throw new Error('Geçersiz e-posta veya şifre');
      }
      throw new Error('Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
