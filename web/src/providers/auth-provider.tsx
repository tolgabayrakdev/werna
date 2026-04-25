import type { ReactNode } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuthStore, useIsAuthenticated, useAuthLoading } from "@/store/auth-store"
import Loading from "@/components/loading"

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const loading = useAuthLoading()
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/sign-in", { replace: true })
    }
  }, [navigate, isAuthenticated, loading])

  if (loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Loading />
  }

  return <>{children}</>
}