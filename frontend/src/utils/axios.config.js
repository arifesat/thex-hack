import axios from 'axios';

// Mock API yanıtları için gecikme süresi (ms)
const MOCK_DELAY = 500;

// Mock veri
const MOCK_LEAVE_REQUESTS = [
  {
    id: 1,
    employeeName: 'Normal User',
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    reason: 'Aile ziyareti',
    status: 'PENDING'
  },
  {
    id: 2,
    employeeName: 'Normal User',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    reason: 'Doktor randevusu',
    status: 'APPROVED'
  },
  {
    id: 3,
    employeeName: 'Normal User',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    reason: 'İş görüşmesi',
    status: 'REJECTED'
  }
];

// Axios instance oluştur
const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API yanıtları
const mockApi = {
  get: async (url) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    if (url === '/leave-requests') {
      return { data: MOCK_LEAVE_REQUESTS };
    }
    
    if (url === '/admin/leave-requests') {
      return { data: MOCK_LEAVE_REQUESTS };
    }
    
    throw new Error('Not found');
  },
  
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    if (url === '/leave-requests') {
      const newRequest = {
        id: MOCK_LEAVE_REQUESTS.length + 1,
        employeeName: 'Normal User',
        ...data,
        status: 'PENDING'
      };
      MOCK_LEAVE_REQUESTS.push(newRequest);
      return { data: newRequest };
    }
    
    throw new Error('Not found');
  },
  
  put: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    if (url.startsWith('/admin/leave-requests/')) {
      const requestId = parseInt(url.split('/').pop());
      const request = MOCK_LEAVE_REQUESTS.find(r => r.id === requestId);
      
      if (request) {
        request.status = data.status;
        if (data.rejectionReason) {
          request.rejectionReason = data.rejectionReason;
        }
        return { data: request };
      }
    }
    
    throw new Error('Not found');
  }
};

// Axios metodlarını mock API ile değiştir
instance.get = mockApi.get;
instance.post = mockApi.post;
instance.put = mockApi.put;

export default instance; 