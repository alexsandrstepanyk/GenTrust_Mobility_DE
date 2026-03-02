import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getById: (id: string) => api.get(`/reports/${id}`),
  approve: (id: string) => api.post(`/reports/${id}/approve`),
  reject: (id: string, reason: string) => api.post(`/reports/${id}/reject`, { reason }),
  forward: (id: string, to: string) => api.post(`/reports/${id}/forward`, { to }),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  approve: (id: string) => api.post(`/users/${id}/approve`),
  reject: (id: string) => api.post(`/users/${id}/reject`),
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getReports: (period: string) => api.get(`/stats/reports?period=${period}`),
};
