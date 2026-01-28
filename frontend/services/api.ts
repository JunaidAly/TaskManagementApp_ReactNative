/**
 * API Client Configuration
 * 
 * This file sets up Axios with interceptors for:
 * - Automatic token attachment
 * - Request/response logging
 * - Error handling
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable or fallback to localhost
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    // Log requests in development
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Log errors in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You could also trigger a logout action or navigation here
    }

    return Promise.reject(error);
  }
);

export default apiClient;
