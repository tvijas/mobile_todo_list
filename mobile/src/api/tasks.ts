// src/api/taskApi.ts
import apiClient from './client';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { UUID } from '../types/common';
import { format } from 'date-fns';

// Format DateTime for API requests
const formatDateForApi = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date;
  }
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

export const taskApi = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.get('/api/task');
    return response.data;
  },

  // Create a new task
  create: async (task: CreateTaskRequest): Promise<Task> => {
    const formattedTask = {
      ...task,
      deadLine: task.deadLine ? formatDateForApi(task.deadLine) : undefined,
      notificationDateTime: task.notificationDateTime ? formatDateForApi(task.notificationDateTime) : undefined,
    };
    
    const response = await apiClient.post('/api/task', formattedTask);
    return response.data;
  },

  // Update a task
  update: async (id: UUID, task: UpdateTaskRequest): Promise<Task> => {
    // For PUT request with query parameters
    const params = new URLSearchParams();
    if (task.name) params.append('name', task.name);
    if (task.deadLine) params.append('deadLine', formatDateForApi(task.deadLine));
    if(task.notificationDateTime) params.append('notificationDateTime', formatDateForApi(task.notificationDateTime))
    const url = `/api/task/${id}?${params.toString()}`;
    const response = await apiClient.put(url);
    return response.data;
  },

  // Mark task as finished
  finish: async (id: UUID): Promise<Task> => {
    const response = await apiClient.patch(`/api/task/${id}`);
    return response.data;
  },

  // Delete a task
  delete: async (id: UUID): Promise<void> => {
    await apiClient.delete(`/api/task/${id}`);
  },
};