import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.auth.login(credentials);
    return response;
  },

  register: async (userData) => {
    const response = await api.auth.register(userData);
    return response;
  },

  getProfile: async () => {
    const response = await api.auth.getProfile();
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export default authService;