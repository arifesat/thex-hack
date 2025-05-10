import axios from 'axios';
import type { AuthResponse, LeaveRequest, LoginRequest, RegisterRequest, LoginResponse, LeaveRequestCreate } from '../types';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', data);
  },
};

export const leaveRequestService = {
  createLeaveRequest: async (data: LeaveRequestCreate): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>('/leaves', data);
    return response.data;
  },

  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get<LeaveRequest[]>('/leaves');
    return response.data;
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leaves/${id}/approve`);
    return response.data;
  },

  rejectLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(`/leaves/${id}/reject`);
    return response.data;
  },
}; 