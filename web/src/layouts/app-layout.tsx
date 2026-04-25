import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import AuthProvider from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/settings", label: "Ayarlar", icon: Settings },
]

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r bg-card sticky top-0 transition-[width] duration-300 ease-in-out overflow-hidden shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 border-b px-3 shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight select-none">Werna</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="block">
            <Button
              variant={isActive(to) ? "secondary" : "ghost"}
              className={cn(
                "w-full h-10",
                collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      <div className={cn("border-t p-2 shrink-0", collapsed && "flex flex-col items-center gap-1")}>
        {collapsed ? (
          <>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary select-none">
              {initials}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
              title="Çıkış Yap"
            >
              <LogOut className="size-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0 select-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-none mb-0.5">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
              title="Çıkış Yap"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <AuthProvider>
      <div className="min-h-screen flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className="flex-1 min-w-0 bg-background overflow-auto">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  )
}
