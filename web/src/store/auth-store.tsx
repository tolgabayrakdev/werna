import { create } from "zustand"

interface User {
    id: string
    email: string
    name: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
    login: (email: string, _password: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: async (email: string, _password: string) => {
        set({
            user: {
                id: "1",
                email,
                name: "Kullanıcı"
            },
            isAuthenticated: true
        })
    },
    logout: () => {
        set({ user: null, isAuthenticated: false })
    },
    checkAuth: async () => {
        return true
    }
}))

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)