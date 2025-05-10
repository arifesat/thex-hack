import axios from 'axios';
import type { AuthResponse, LeaveRequest, LoginRequest, RegisterRequest, LoginResponse, LeaveRequestCreate } from '../types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Authentication error - Token might be invalid or expired');
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const leaveRequestService = {
  createLeaveRequest: async (data: LeaveRequestCreate): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>('/leaves', data);
    return response.data;
  },

  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
      const response = await api.get<LeaveRequest[]>('/leaves');
      return response.data;
    } catch (error) {
      console.error('Error in getLeaveRequests:', error);
      throw error;
    }
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leaves/${id}/approve`);
    return response.data;
  },

  rejectLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leaves/${id}/reject`);
    return response.data;
  }
}; 