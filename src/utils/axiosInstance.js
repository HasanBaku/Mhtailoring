// src/utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});


instance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'null') {  // <-- This check is critical
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));



instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('⛔ Invalid or expired token. Logging out...');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export default instance;
