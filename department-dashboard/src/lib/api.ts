import axios from 'axios';

// Визначаємо департамент на основі порту
const getDepartmentFromPort = (): string => {
  const port = window.location.port;
  const portToDept: Record<string, string> = {
    '5180': 'roads',
    '5181': 'lighting',
    '5182': 'waste',
    '5183': 'parks',
    '5184': 'water',
    '5185': 'transport',
    '5186': 'ecology',
    '5187': 'vandalism',
    '5175': 'roads', // Default for base department dashboard
  };
  return portToDept[port] || 'roads';
};

const DEPARTMENT_ID = getDepartmentFromPort();
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

// Department-specific API
export const departmentAPI = {
  // Get department info
  getInfo: () => api.get(`/reports?category=${DEPARTMENT_ID}`),
  
  // Get department reports - ФІЛЬТРУЄМО ПО category
  getReports: (params?: { status?: string; page?: number; limit?: number }) => {
    const statusFilter = params?.status ? `&status=${params.status}` : '';
    const limitFilter = params?.limit || 50;
    return api.get(`/reports?category=${DEPARTMENT_ID}${statusFilter}&limit=${limitFilter}`);
  },
  
  // Get single report
  getReport: (reportId: string) => 
    api.get(`/reports/${reportId}`),
  
  // Update report status
  updateStatus: (reportId: string, data: { status: string; rejectionReason?: string; moderatedBy?: string }) =>
    api.post(`/reports/${reportId}/approve`, data),
  
  // Get department stats
  getStats: () => api.get('/stats/dashboard'),
  
  // Get department settings
  getSettings: () => api.get('/stats/dashboard'),
  
  // Update department settings
  updateSettings: (data: any) => 
    api.patch('/stats/dashboard', data),
};

// Legacy API (for backward compatibility with main backend)
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
  getDepartment: () => departmentAPI.getStats(),
};

// Export department info
export { DEPARTMENT_ID };
