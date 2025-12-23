import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Не авторизован');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  },
  logout: () => {
    window.location.href = `${API_BASE_URL}/auth/logout`;
  }
};

export default api;