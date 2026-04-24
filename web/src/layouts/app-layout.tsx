import { Outlet, Link, useLocation } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import AuthProvider from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

function Sidebar() {
    const { user, logout } = useAuthStore()
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path

    return (
        <aside className="w-64 border-r bg-card flex flex-col">
            <div className="p-6 border-b">
                <h1 className="text-xl font-semibold">Werna</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link to="/">
                    <Button
                        variant={isActive("/") ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        Dashboard
                    </Button>
                </Link>
                <Link to="/settings">
                    <Button
                        variant={isActive("/settings") ? "secondary" : "ghost"}
                        className="w-full justify-start"
                    >
                        Ayarlar
                    </Button>
                </Link>
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-muted-foreground text-xs">{user?.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout}>
                        Çıkış
                    </Button>
                </div>
            </div>
        </aside>
    )
}

export default function AppLayout() {
    return (
        <AuthProvider>
            <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 bg-background">
                    <Outlet />
                </main>
            </div>
        </AuthProvider>
    )
}