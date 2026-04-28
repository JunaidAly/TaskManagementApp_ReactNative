import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── User / Auth ──────────────────────────────────────────────────────────────
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
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['authToken', 'user']);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    try {
      const [token, userStr] = await AsyncStorage.multiGet(['authToken', 'user']);
      if (token[1] && userStr[1]) {
        set({ user: JSON.parse(userStr[1]), token: token[1], isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  category: 'work' | 'personal' | 'health' | 'shopping' | 'finance' | 'other';
  isArchived: boolean;
  userId: string;
  subtasks: Subtask[];
  tags: string[];
  recurrence: { enabled: boolean; type?: 'daily' | 'weekly' | 'monthly'; interval?: number };
  completedAt?: string;
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
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, updates) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t._id === id ? { ...t, ...updates } : t)) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ─── Settings ─────────────────────────────────────────────────────────────────
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
      const [theme, notif] = await AsyncStorage.multiGet(['theme', 'notificationsEnabled']);
      set({
        theme: (theme[1] as any) || 'system',
        notificationsEnabled: notif[1] !== 'false',
      });
    } catch {/* ignore */}
  },
}));

// ─── Onboarding ───────────────────────────────────────────────────────────────
interface OnboardingState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;
  loadOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenOnboarding: false,

  setHasSeenOnboarding: async (seen) => {
    await AsyncStorage.setItem('hasSeenOnboarding', String(seen));
    set({ hasSeenOnboarding: seen });
  },

  loadOnboarding: async () => {
    const val = await AsyncStorage.getItem('hasSeenOnboarding');
    set({ hasSeenOnboarding: val === 'true' });
  },
}));
