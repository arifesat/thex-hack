import axios from '../utils/axios.config';

export const leaveService = {
  // Get all leave requests for the current user
  getLeaveRequests: async () => {
    try {
      const response = await axios.get('/api/leaves');
      console.log('API Response:', response); // Debug için
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response || error);
      throw error;
    }
  },

  // Create a new leave request
  createLeaveRequest: async (leaveData) => {
    try {
      const response = await axios.post('/api/leaves', leaveData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response || error);
      throw error;
    }
  },

  // Approve a leave request
  approveLeaveRequest: async (requestId) => {
    try {
      const response = await axios.post(`/api/leaves/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response || error);
      throw error;
    }
  },

  // Reject a leave request
  rejectLeaveRequest: async (requestId) => {
    try {
      const response = await axios.post(`/api/leaves/${requestId}/reject`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response || error);
      throw error;
    }
  }
};

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await axios.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await axios.get('/api/auth/debug/user/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem('user');
  }
}; 