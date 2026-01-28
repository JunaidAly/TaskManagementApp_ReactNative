/**
 * Zustand Store for Global State Management
 * 
 * Why Zustand?
 * - Simpler API compared to Redux (no boilerplate)
 * - Built-in TypeScript support
 * - Small bundle size (~1KB)
 * - Easy to learn for beginners
 * - No need for Context providers
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Store - Manages authentication state
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => set({ token }),

  login: async (user, token) => {
    try {
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      set({ isLoading: false });
    }
  },
}));

// Task Store - Manages task state
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  isArchived: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks, error: null }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task._id === id ? { ...task, ...updates } : task
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task._id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));

// App Settings Store - Manages app preferences
interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  notificationsEnabled: true,

  setTheme: async (theme) => {
    await AsyncStorage.setItem('theme', theme);
    set({ theme });
  },

  setNotificationsEnabled: async (enabled) => {
    await AsyncStorage.setItem('notificationsEnabled', String(enabled));
    set({ notificationsEnabled: enabled });
  },

  loadSettings: async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
      
      set({
        theme: (theme as any) || 'system',
        notificationsEnabled: notificationsEnabled !== 'false',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
}));
