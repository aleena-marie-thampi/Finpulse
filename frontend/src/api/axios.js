import axios from 'axios';

const api = axios.create({
  // Add /api to the end of your baseURL
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// This automatically attaches your token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fp_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;