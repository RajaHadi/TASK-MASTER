import type {
  AuthResponse,
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from "@/src/types";
import { authClient } from "./better-auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

// Utility to get JWT token
async function getToken(): Promise<string | null> {
  try {
    const { data } = await authClient.token();
    if (data?.token) return data.token;
  } catch {}
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  requireAuth = true, // <-- only require auth for protected endpoints
): Promise<T> {
  let jwtToken: string | null = null;

  if (requireAuth) {
    jwtToken = await getToken();

    if (!jwtToken) {
      if (typeof window !== "undefined") {
        console.log("No valid token found, redirecting to login...");
        window.location.href = "/login";
      }
      throw new Error("Unauthorized: No valid token");
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error(data.error?.message || "Request failed");
  }

  return data;
}

export const api = {
  // Auth (no token required)
  signup: (email: string, password: string) =>
    apiRequest<AuthResponse>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    ),

  login: async (email: string, password: string) => {
    const data = await apiRequest<AuthResponse>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    );

    // Store token after login
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  logout: async () => {
    const data = await apiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
    // Clear stored token
    if (typeof window !== "undefined") localStorage.removeItem("token");
    return data;
  },

  // Tasks (protected endpoints, require token)
  getTasks: () => apiRequest<{ tasks: Task[] }>("/api/tasks"),
  createTask: (title: string) =>
    apiRequest<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  updateTask: (id: string, data: UpdateTaskRequest) =>
    apiRequest<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTask: (id: string) =>
    apiRequest<{ message: string }>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
};
