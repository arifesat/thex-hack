import axios from '../utils/axios.config';

export const leaveService = {
  // Get all leave requests for the current user
  getLeaveRequests: async () => {
    const response = await axios.get('/leave-requests');
    return response.data;
  },

  // Create a new leave request
  createLeaveRequest: async (leaveData) => {
    const response = await axios.post('/leave-requests', leaveData);
    return response.data;
  },

  // Get all leave requests for admin approval
  getLeaveRequestsForApproval: async () => {
    const response = await axios.get('/admin/leave-requests');
    return response.data;
  },

  // Approve or reject a leave request
  updateLeaveRequestStatus: async (requestId, status, rejectionReason = null) => {
    const response = await axios.put(`/admin/leave-requests/${requestId}`, {
      status,
      rejectionReason
    });
    return response.data;
  }
};

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  }
}; 