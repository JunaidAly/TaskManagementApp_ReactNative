import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { Task, Subtask } from '../store';

const CACHE_KEY = 'tasks_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Types ───────────────────────────────────────────────────────────────────

export type { Task, Subtask };

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done';
  category?: Task['category'];
  subtasks?: Array<{ title: string; completed?: boolean }>;
  tags?: string[];
  recurrence?: { enabled: boolean; type?: string; interval?: number };
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  isArchived?: boolean;
  subtasks?: Array<{ _id?: string; title: string; completed?: boolean }>;
}

export interface TaskFilters {
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  category?: Task['category'];
  isArchived?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface TasksResponse {
  status: string;
  results: number;
  data: { tasks: Task[] };
}

export interface TaskResponse {
  status: string;
  message?: string;
  data: { task: Task };
}

export interface TaskStatsResponse {
  status: string;
  data: {
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    doneTasks: number;
    archivedTasks: number;
  };
}

export interface WeeklyDataPoint {
  date: string;
  count: number;
  label: string;
}

export interface CategoryStat {
  _id: Task['category'];
  total: number;
  done: number;
}

export interface AnalyticsResponse {
  status: string;
  data: {
    streak: number;
    weeklyData: WeeklyDataPoint[];
    categoryBreakdown: CategoryStat[];
    onTimeRate: number;
    totalCompletedLast30Days: number;
  };
}

// ─── Offline Cache ────────────────────────────────────────────────────────────

async function saveToCache(key: string, data: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
}

async function loadFromCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data as T;
  } catch {
    return null;
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const getTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
  }

  try {
    const response = await apiClient.get<TasksResponse>(`/tasks?${params}`);
    await saveToCache(`${CACHE_KEY}_${params}`, response.data);
    return response.data;
  } catch (err) {
    const cached = await loadFromCache<TasksResponse>(`${CACHE_KEY}_${params}`);
    if (cached) return cached;
    throw err;
  }
};

export const getTaskById = async (id: string): Promise<TaskResponse> => {
  const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: CreateTaskData): Promise<TaskResponse> => {
  const response = await apiClient.post<TaskResponse>('/tasks', data);
  return response.data;
};

export const updateTask = async (id: string, data: UpdateTaskData): Promise<TaskResponse> => {
  const response = await apiClient.put<TaskResponse>(`/tasks/${id}`, data);
  return response.data;
};

export const toggleSubtask = async (taskId: string, subtaskId: string): Promise<TaskResponse> => {
  const response = await apiClient.patch<TaskResponse>(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
  return response.data;
};

export const deleteTask = async (id: string): Promise<{ status: string; message: string }> => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

export const getTaskStats = async (): Promise<TaskStatsResponse> => {
  const response = await apiClient.get<TaskStatsResponse>('/tasks/stats/summary');
  return response.data;
};

export const getAnalytics = async (): Promise<AnalyticsResponse> => {
  try {
    const response = await apiClient.get<AnalyticsResponse>('/tasks/analytics');
    await saveToCache('analytics_cache', response.data);
    return response.data;
  } catch (err) {
    const cached = await loadFromCache<AnalyticsResponse>('analytics_cache');
    if (cached) return cached;
    throw err;
  }
};

export default { getTasks, getTaskById, createTask, updateTask, toggleSubtask, deleteTask, getTaskStats, getAnalytics };
