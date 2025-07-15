import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ Make sure this matches your backend
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
