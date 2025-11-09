import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  return axiosInstance.post('/api/auth/register', userData);
};

export const loginUser = async (credentials) => {
  return axiosInstance.post('/api/auth/login', credentials);
};

export const fetchProfile = async () => {
  return axiosInstance.get('/api/auth/profile');
};