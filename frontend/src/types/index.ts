export interface User {
  id?: string;
  calisanId: number;
  adSoyad: string;
  pozisyon: string;
  email: string;
  role: string;
  enabled?: boolean;
}

export interface LeaveRequest {
  id: string;
  calisanId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  adSoyad: string;
  pozisyon: string;
  calisanId: number;
  role?: string;
}

// Add these types for the API responses
export interface LoginResponse {
  token: string;
  user: User;
}

export interface LeaveRequestCreate {
  startDate: string;
  endDate: string;
  reason: string;
} 