import axios from 'axios';

// Axios instance oluştur
const instance = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Önce token'ı localStorage'dan al
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers:', config.headers); // Debug için
    } else {
      console.warn('No token found in localStorage'); // Debug için
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error); // Debug için
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error); // Debug için
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 