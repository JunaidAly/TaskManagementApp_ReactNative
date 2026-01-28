/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import apiClient from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
  };
}

export interface ProfileResponse {
  status: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
  };
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/auth/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: { name?: string; email?: string }): Promise<ProfileResponse> => {
  const response = await apiClient.put<ProfileResponse>('/auth/profile', data);
  return response.data;
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
};
