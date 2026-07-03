import { useState, useEffect, useCallback } from 'react';
import { authService, AdminUser } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeUser = await authService.getCurrentUser();
      setUser(activeUser);
    } catch (err: any) {
      console.error('Session validation error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { user: signedInUser, error: err } = await authService.signInWithPassword(email, password);
      if (err) {
        setError(err.message);
        setUser(null);
        return false;
      }
      setUser(signedInUser);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Login failed unexpectedly');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { success, error: err } = await authService.signUpAdmin(email, password);
      if (err) {
        setError(err.message);
        return false;
      }
      return success;
    } catch (err: any) {
      setError(err?.message || 'Admin sign up failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Failed to log out:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkSession,
    isAuthenticated: !!user,
    isAdmin: user && ['super_admin', 'admin'].includes(user.role)
  };
}
