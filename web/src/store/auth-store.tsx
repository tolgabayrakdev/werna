import { create } from "zustand"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  username: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const res = await apiClient.post<{ success: boolean; data: User }>("/api/auth/login", { email, password })
      set({ user: res.data, isAuthenticated: true, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  register: async (email: string, username: string, password: string) => {
    set({ loading: true })
    try {
      await apiClient.post("/api/auth/register", { email, username, password })
      set({ loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  logout: async () => {
    try {
      await apiClient.post("/api/auth/logout")
    } finally {
      set({ user: null, isAuthenticated: false })
    }
  },
  checkAuth: async () => {
    set({ loading: true })
    try {
      const res = await apiClient.get<{ success: boolean; data: User }>("/api/account/me")
      set({ user: res.data, isAuthenticated: true, loading: false })
      return true
    } catch {
      set({ user: null, isAuthenticated: false, loading: false })
      return false
    }
  },
}))

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useAuthLoading = () => useAuthStore((state) => state.loading)