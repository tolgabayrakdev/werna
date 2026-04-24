import type { ReactNode } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useIsAuthenticated } from "@/store/auth-store"
import Loading from "@/components/loading"

interface AuthProviderProps {
    children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate()
    const isAuthenticated = useIsAuthenticated()

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/sign-in", { replace: true })
        }
    }, [navigate, isAuthenticated])

    if (!isAuthenticated) {
        return <Loading />
    }

    return <>{children}</>
}