import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, { email, password });
      setUser(data.data);
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || (error.request ? 'Cannot connect to backend server. Please ensure server is running on port 5000.' : 'Login failed')
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, userData);
      setUser(data.data);
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || (error.request ? 'Cannot connect to backend server. Please ensure server is running on port 5000.' : 'Registration failed')
      };
    }
  };

  const googleLogin = async (token) => {
    try {
      const { data } = await axios.post(`${API_URL}/google`, { token });
      setUser(data.data);
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google Login failed' };
    }
  };

  const requestOtp = async (identifier) => {
    try {
      const { data } = await axios.post(`${API_URL}/request-otp`, { identifier });
      return { success: true, message: data.message, devOtp: data.devOtp };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to request OTP' };
    }
  };

  const verifyOtpLogin = async (identifier, otp) => {
    try {
      const { data } = await axios.post(`${API_URL}/verify-otp-login`, { identifier, otp });
      setUser(data.data);
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Invalid OTP' };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, googleLogin, requestOtp, verifyOtpLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
