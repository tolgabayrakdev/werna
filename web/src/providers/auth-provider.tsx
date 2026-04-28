import type { ReactNode } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuthStore, useIsAuthenticated, useAuthLoading } from "@/store/auth-store"
import Loading from "@/components/loading"
import SessionExpiredDialog from "@/components/session-expired-dialog"

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const loading = useAuthLoading()
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const rateLimited = useAuthStore((state) => state.rateLimited)
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const setSessionExpired = useAuthStore((state) => state.setSessionExpired)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    const handler = () => {
      if (useAuthStore.getState().isAuthenticated) {
        setSessionExpired(true)
      }
    }
    window.addEventListener("auth:session-expired", handler)
    return () => window.removeEventListener("auth:session-expired", handler)
  }, [setSessionExpired])

  useEffect(() => {
    if (!isAuthenticated && !loading && !sessionExpired && !rateLimited) {
      navigate("/sign-in", { replace: true })
    }
  }, [navigate, isAuthenticated, loading, sessionExpired, rateLimited])

  if (loading) {
    return <Loading />
  }

  if (rateLimited && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-semibold">Too Many Requests</h2>
          <p className="text-sm text-muted-foreground">
            Too many requests have been sent to the server. Please wait a moment and try again.
          </p>
          <button
            onClick={() => {
              useAuthStore.setState({ rateLimited: false })
              checkAuth()
            }}
            className="text-sm text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SessionExpiredDialog />
      {isAuthenticated && children}
    </>
  )
}