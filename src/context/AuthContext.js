import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, getProfile } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const profileData = await AsyncStorage.getItem('profile');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      console.log('Making API call to register...');
      const response = await apiRegister(userData);
      console.log('Registration response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Registration failed';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data) {
          // Handle Django REST framework error format
          const data = error.response.data;
          if (typeof data === 'object') {
            // Combine all error messages
            const messages = [];
            for (const [field, errors] of Object.entries(data)) {
              if (Array.isArray(errors)) {
                messages.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                messages.push(`${field}: ${errors}`);
              }
            }
            if (messages.length > 0) {
              errorMessage = messages.join('\n');
            }
          } else if (typeof data === 'string') {
            errorMessage = data;
          }
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Check if backend is running.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await apiLogin(username, password);
      const { token, user, profile } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
      
      setUser(user);
      setProfile(profile);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      let errorMessage = 'Login failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('profile');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      await AsyncStorage.setItem('profile', JSON.stringify(response.data));
    } catch (error) {
      console.log('Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};