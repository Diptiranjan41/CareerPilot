import api from './api';

const authService = {
  // LOGIN - User login karega
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // SIGNUP - New account banayega
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Signup failed" };
    }
  },

  // FORGOT PASSWORD - OTP bhejega
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send OTP" };
    }
  },

  // VERIFY OTP - OTP verify karega
  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Invalid OTP" };
    }
  },

  // RESET PASSWORD - Naya password set karega
  resetPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  // LOGOUT - User logout karega
  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  // GET CURRENT USER - Logged in user ki info
  getCurrentUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;