import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    setUser(res.data.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    setUser(res.data.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const value = { user, setUser, loading, login, register, logout, fetchUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
