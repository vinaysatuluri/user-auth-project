import axios from 'axios';

// Create an Axios instance for your API
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,  // Set a timeout for the requests
});

// Sign Up Function
export const signUp = async (formData) => {
  try {
    const response = await api.post('/auth/signup', formData);
    return response.data;
  } catch (error) {
    // Handle errors more explicitly
    throw error.response
      ? error.response.data
      : error.request
      ? 'No response received from server.'
      : 'Network error or server unreachable';
  }
};

// Login Function
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : 'Network error or server unreachable';
  }
};

// OTP Verification Function
export const verifyOtp = async (otpData) => {
  try {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : 'Network error or server unreachable';
  }
};

// Password Reset Function
export const resetPassword = async (resetData) => {
  try {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : 'Network error or server unreachable';
  }
};

// Profile API Call
export const getProfile = async (token) => {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error: ', error);  // Log error for debugging
    throw error.response
      ? error.response.data
      : 'Network error or server unreachable';
  }
};

export default api;
