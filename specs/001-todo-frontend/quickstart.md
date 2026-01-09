# Quickstart: Todo Frontend Implementation

**Feature**: 001-todo-frontend | **Date**: 2026-01-04
**Purpose**: Quick reference guide for frontend implementation

## Prerequisites

- Node.js 18+ and npm
- Next.js 16+ with App Router
- TypeScript and Tailwind CSS
- Backend API running at `http://localhost:8000` (or configured via env)
- Better Auth configured for authentication

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Landing page
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Signup page
│   └── dashboard/
│       └── page.tsx            # Tasks dashboard (protected)
│
├── components/                   # Reusable UI components
│   ├── ui/                      # Basic UI elements
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Alert.tsx
│   │   └── Loading.tsx
│   ├── layout/                  # Layout components
│   │   └── Navbar.tsx
│   └── task/                    # Task-specific components
│       ├── TaskList.tsx
│       ├── TaskItem.tsx
│       ├── TaskForm.tsx
│       └── DeleteDialog.tsx
│
├── lib/                          # Utility functions
│   ├── api.ts                   # Centralized API client
│   ├── auth.ts                  # Auth utilities
│   └── validation.ts            # Validation helpers
│
├── types/                        # TypeScript type definitions
│   ├── api.ts                   # API contract types
│   └── index.ts                 # Exported types
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Auth state management
│   ├── useTasks.ts              # Task operations
│   └── useApi.ts               # API request wrapper
│
└── styles/                       # Global styles
    └── globals.css              # Tailwind directives
```

## Setup Steps

### 1. Initialize Next.js Project

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

### 2. Install Dependencies

```bash
npm install better-auth/react clsx tailwind-merge
npm install -D @types/node
```

### 3. Configure Environment Variables

Create `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration (if needed)
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
```

### 4. Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 5. Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

## Core Components

### Navigation Bar (`components/layout/Navbar.tsx`)

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold">Todo App</h1>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <button onClick={logout} className="text-sm text-red-600">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <a href="/login" className="text-sm">Login</a>
            <a href="/signup" className="text-sm">Signup</a>
          </div>
        )}
      </div>
    </nav>
  );
}
```

### API Client (`lib/api.ts`)

```typescript
import type { ApiError, Task, User, AuthResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = '/login';
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
    apiRequest<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  updateTask: (id: string, data: Partial<Task>) =>
    apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: string) =>
    apiRequest<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
};
```

## Authentication Flow

### Login Page (`app/login/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await api.login(email, password);
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && <div className="bg-red-100 text-red-800 p-3 mb-4">{error}</div>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 p-2 border"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 p-2 border"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

## Task Management Flow

### Dashboard Page (`app/dashboard/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Task } from '@/types';
import { TaskList } from '@/components/task/TaskList';
import { TaskForm } from '@/components/task/TaskForm';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { tasks } = await api.getTasks();
      setTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (title: string) => {
    try {
      const { task } = await api.createTask(title);
      setTasks((prev) => [task, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleToggleTask = async (id: string, status: Task['status']) => {
    const newStatus = status === 'pending' ? 'completed' : 'pending';

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );

    try {
      await api.updateTask(id, { status: newStatus });
    } catch (err) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status } : task
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

      <TaskForm onSubmit={handleCreateTask} />
      <TaskList
        tasks={tasks}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
```

## Responsive Design Guidelines

### Mobile-First Classes

```typescript
// Default (mobile): Single column, full width
<div className="w-full p-4">

// Tablet (768px+): Two columns, grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Desktop (1024px+): Three columns, more spacing
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
```

### Touch-Friendly Targets

```typescript
// Minimum 44x44 pixels for touch targets
<button className="px-4 py-2 min-w-[44px]">
```

## Common Patterns

### Form Validation

```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
```

### Loading States

```typescript
// Button loading state
<button disabled={loading} className={loading ? 'opacity-50' : ''}>
  {loading ? 'Loading...' : 'Submit'}
</button>

// Skeleton loading
<div className="animate-pulse bg-gray-200 h-4 rounded"></div>
```

### Error Display

```typescript
{error && (
  <div className="bg-red-100 text-red-800 p-4 rounded">
    {error}
  </div>
)}
```

## Testing

Run the development server:

```bash
npm run dev
```

Access the application:
- Landing page: http://localhost:3000
- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup
- Dashboard: http://localhost:3000/dashboard (requires auth)

## Next Steps

1. Review the full implementation plan in `plan.md`
2. Execute tasks in order following `tasks.md` (generated by `/sp.tasks`)
3. Test each phase before proceeding to the next
4. Refer to API contracts in `contracts/api-contracts.md` for backend integration

## Summary

This quickstart provides:
- Project structure overview
- Setup instructions
- Core component examples
- Authentication flow
- Task management flow
- Responsive design guidelines
- Common patterns

For complete implementation details, refer to:
- `plan.md`: Full implementation plan with all phases
- `research.md`: Technical decisions and best practices
- `data-model.md`: Data structures and state management
- `contracts/api-contracts.md`: Complete API specifications
