/**
 * Task Service
 * Handles all task-related API calls
 */

import apiClient from './api';

export interface Task {
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

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done';
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  isArchived?: boolean;
}

export interface TasksResponse {
  status: string;
  results: number;
  data: {
    tasks: Task[];
  };
}

export interface TaskResponse {
  status: string;
  message?: string;
  data: {
    task: Task;
  };
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

export interface TaskFilters {
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  isArchived?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Get all tasks with optional filters
 */
export const getTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await apiClient.get<TasksResponse>(`/tasks?${params.toString()}`);
  return response.data;
};

/**
 * Get task by ID
 */
export const getTaskById = async (id: string): Promise<TaskResponse> => {
  const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
  return response.data;
};

/**
 * Create new task
 */
export const createTask = async (data: CreateTaskData): Promise<TaskResponse> => {
  const response = await apiClient.post<TaskResponse>('/tasks', data);
  return response.data;
};

/**
 * Update task
 */
export const updateTask = async (id: string, data: UpdateTaskData): Promise<TaskResponse> => {
  const response = await apiClient.put<TaskResponse>(`/tasks/${id}`, data);
  return response.data;
};

/**
 * Delete task
 */
export const deleteTask = async (id: string): Promise<{ status: string; message: string }> => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Get task statistics
 */
export const getTaskStats = async (): Promise<TaskStatsResponse> => {
  const response = await apiClient.get<TaskStatsResponse>('/tasks/stats/summary');
  return response.data;
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
