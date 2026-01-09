import type { User } from '@/src/types';
import { authClient } from './better-auth';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Better Auth session management
export async function getSession() {
  try {
    const session = await authClient.getSession();
    return session;
  } catch (error) {
    return null;
  }
}

// For backward compatibility with existing code
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function setUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function removeUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  // Check Better Auth session first
  try {
    const session = await authClient.getSession();
    if (session?.data?.session) {
      return true;
    }
  } catch (error) {
    // Session check failed, fall back to localStorage
  }

  // Fallback to localStorage token check
  return getToken() !== null;
}

// Synchronous version for backward compatibility (checks localStorage only)
export function isAuthenticatedSync(): boolean {
  return getToken() !== null;
}

export async function logout(): Promise<void> {
  try {
    // Sign out using Better Auth
    await authClient.signOut();
  } catch (error) {
    console.error('Better Auth signout error:', error);
  }

  // Clean up local storage
  removeToken();
  removeUser();

  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export async function requireAuth(): Promise<boolean> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
}

// Synchronous version for backward compatibility (checks localStorage only)
export function requireAuthSync(): boolean {
  if (!isAuthenticatedSync()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
}

// Better Auth helpers - these call our backend via Better Auth client
export async function signUpWithBetterAuth(email: string, password: string) {
  try {
    // Call Better Auth signup endpoint (will call our backend's /auth/signup)
    const result = await authClient.signUp.email({
      email,
      password,
      name: email.split('@')[0],
    });

    // Check for errors
    if (result.error) {
      throw new Error(result.error.message || 'Signup failed');
    }

    // Get user and session from result
    if (result.data?.user && result.data?.session) {
      const backendUser = result.data.user;
      const session = result.data.session;

      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        emailVerified: backendUser.emailVerified,
        createdAt: new Date(backendUser.createdAt || new Date()).toISOString(),
        updatedAt: new Date(backendUser.updatedAt || new Date()).toISOString(),
      };

      setUser(user);

      // Get JWT token from session
      const token = session.token || '';
      if (token) {
        setToken(token);
      }

      return { user, token };
    }

    throw new Error('Signup failed - no user data returned');
  } catch (error) {
    throw error;
  }
}

export async function signInWithBetterAuth(email: string, password: string) {
  try {
    // Call Better Auth login endpoint (will call our backend's /auth/login)
    const result = await authClient.signIn.email({
      email,
      password,
    });

    // Check for errors
    if (result.error) {
      throw new Error(result.error.message || 'Login failed');
    }

    // Get user and session from result
    if (result.data?.user && result.data?.session) {
      const backendUser = result.data.user;
      const session = result.data.session;

      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        emailVerified: backendUser.emailVerified,
        createdAt: new Date(backendUser.createdAt || new Date()).toISOString(),
        updatedAt: new Date(backendUser.updatedAt || new Date()).toISOString(),
      };

      setUser(user);

      // Get JWT token from session
      const token = session.token || '';
      if (token) {
        setToken(token);
      }

      return { user, token };
    }

    throw new Error('Login failed - no user data returned');
  } catch (error) {
    throw error;
  }
}
