import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<{ userId: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);