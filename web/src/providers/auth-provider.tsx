import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/auth.context';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import type { User } from '@/contexts/auth.context';

const AUTH_CHECK_TIMEOUT = 12000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setUser(null);
        setIsLoading(false);
      }
    }, AUTH_CHECK_TIMEOUT);

    userService
      .getProfile()
      .then((res) => {
        if (!cancelled) {
          clearTimeout(timeout);
          setUser(res.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.data);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const res = await authService.register({ email, username, password });
    return { userId: res.data.id };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Token'lar sunucudan silinemese bile client tarafında temizliyoruz
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}