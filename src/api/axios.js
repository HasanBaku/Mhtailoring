import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ⬇️ redirect to /login if token is invalid/expired or user is unauthorized
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('lastActive');
      // optional: also clear cached role/user
      localStorage.removeItem('userRole');
      window.location.href = '/login';
      return; // stop further handling
    }
    return Promise.reject(error);
  }
);

export default api;
