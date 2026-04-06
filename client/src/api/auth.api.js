import axiosInstance from './axiosInstance';

// Add interceptor ONCE
let interceptorAdded = false;

if (!interceptorAdded) {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return Promise.reject(error);
    }
  );

  interceptorAdded = true;
}

// Your existing functions (UNCHANGED)
export const registerUser = (userData) => {
  return axiosInstance.post('/api/auth/register', userData);
};

export const loginUser = (credentials) => {
  return axiosInstance.post('/api/auth/login', credentials);
};

export const fetchProfile = () => {
  return axiosInstance.get('/api/auth/profile');
};

export default axiosInstance;
