import type { AuthResponse, CreateTaskRequest, Task, UpdateTaskRequest } from '@/src/types';
import { authClient } from './better-auth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get JWT token using Better Auth's token() method (recommended approach per jwt.md)
  let jwtToken: string | null = null;

  try {
    const { data, error } = await authClient.token();
    if (data?.token) {
      jwtToken = data.token;
    }
  } catch (error) {
    // Token retrieval failed - user may not be authenticated
  }

  // Fallback to localStorage token if Better Auth token() fails
  if (!jwtToken && typeof window !== 'undefined') {
    jwtToken = localStorage.getItem('token');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  signup: (email: string, password: string) =>
    apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Tasks
  getTasks: () =>
    apiRequest<{ tasks: Task[] }>('/api/tasks'),

  createTask: (title: string) =>
    apiRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  updateTask: (id: string, data: UpdateTaskRequest) =>
    apiRequest<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: string) =>
    apiRequest<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
};
