import axios from 'axios';
import { LoginRequest, LoginResponse, User, Feedback, DashboardStats, FeedbackCreate, FeedbackUpdate } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Error details:', error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if we're already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('Attempting login for:', data.username);
      const response = await api.post('/auth/login', data);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  },
  
  register: async (data: { username: string; email: string; role: string; manager_id?: number }): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.');
    }
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  getManagers: async (): Promise<User[]> => {
    const response = await api.get('/users/managers');
    return response.data;
  },
};

export const userAPI = {
  getTeamMembers: async (): Promise<User[]> => {
    const response = await api.get('/users/team');
    return response.data;
  },
};

export const feedbackAPI = {
  createFeedback: async (data: FeedbackCreate): Promise<Feedback> => {
    const response = await api.post('/feedback', data);
    return response.data;
  },
  
  getFeedback: async (): Promise<Feedback[]> => {
    const response = await api.get('/feedback');
    return response.data;
  },
  
  getEmployeeFeedback: async (employeeId: number): Promise<Feedback[]> => {
    const response = await api.get(`/feedback/employee/${employeeId}`);
    return response.data;
  },
  
  updateFeedback: async (feedbackId: number, data: FeedbackUpdate): Promise<Feedback> => {
    const response = await api.put(`/feedback/${feedbackId}`, data);
    return response.data;
  },
  
  acknowledgeFeedback: async (feedbackId: number): Promise<void> => {
    await api.put(`/feedback/${feedbackId}/acknowledge`);
  },
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default api;