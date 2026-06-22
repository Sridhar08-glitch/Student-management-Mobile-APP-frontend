import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your computer's IP address
const BASE_URL = 'http://192.168.1.35:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  async (config) => {
    console.log('🌐 Making request to:', config.baseURL + config.url);
    console.log('📦 Request data:', config.data);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token found:', token.substring(0, 20) + '...');
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.log('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const login = (username, password) => {
  return api.post('/login/', { username, password });
};

export const register = (userData) => {
  return api.post('/register/', userData);
};

export const getProfile = () => {
  return api.get('/profile/');
};

export const getStudents = () => {
  return api.get('/students/');
};

export const markAttendance = (data) => {
  return api.post('/attendance/', data);
};

export const addMarks = (data) => {
  return api.post('/marks/', data);
};

export const getStudentAttendance = (studentId) => {
  return api.get(`/student/${studentId}/attendance/`);
};

export const getStudentMarks = (studentId) => {
  return api.get(`/student/${studentId}/marks/`);
};

export const getNotifications = () => {
  return api.get('/notifications/');
};

export const createNotification = (data) => {
  return api.post('/notifications/create/', data);
};
export const getSubjects = () => {
  return api.get('/subjects/');
};

export const createSubject = (data) => {
  return api.post('/subjects/', data);
};

export const updateSubject = (id, data) => {
  return api.put(`/subjects/${id}/`, data);
};

export const deleteSubject = (id) => {
  return api.delete(`/subjects/${id}/`);
};

export default api;