export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;   // <-- add this
  updatedAt: string; 
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  status?: 'pending' | 'completed';
  title?: string;
}
