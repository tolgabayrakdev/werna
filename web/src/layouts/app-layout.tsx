import { useState, useEffect, useCallback } from "react"
import { Outlet, Link, useLocation } from "react-router"
import { useAuthStore } from "@/store/auth-store"
import AuthProvider from "@/providers/auth-provider"
import OnboardingDialog from "@/components/onboarding-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Link2,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import wernaLogo from "@/assets/werna_logo.svg"
import { useTheme } from "@/providers/theme-provider"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/links", label: "Bağlantılar", icon: Link2 },
  { to: "/feedbacks", label: "Geri Bildirimler", icon: MessageSquare },
  { to: "/settings", label: "Ayarlar", icon: Settings },
]

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    onMobileClose()
  }, [location.pathname, onMobileClose])

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <>
      <aside
        className={cn(
          "h-screen flex flex-col bg-card z-40 border-r",
          "fixed inset-y-0 left-0 w-72 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:translate-x-0 lg:transition-[width] lg:duration-300",
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 px-3 shrink-0 border-b",
            collapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          {/* Mobile: always show logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img src={wernaLogo} alt="Werna" className="h-7 w-auto" />
            <span className="text-lg font-bold tracking-tight select-none">Werna</span>
          </div>
          {/* Desktop: hide when collapsed */}
          {!collapsed && (
            <div className="hidden lg:flex items-center gap-2">
              <img src={wernaLogo} alt="Werna" className="h-7 w-auto" />
              <span className="text-lg font-bold tracking-tight select-none">Werna</span>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 hidden lg:flex"
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 lg:hidden"
            onClick={onMobileClose}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to)
            return (
              <Tooltip key={to} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full h-10 relative overflow-hidden transition-all duration-200 rounded-lg",
                      active
                        ? "bg-primary/8 text-primary font-medium hover:bg-primary/12"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed
                        ? "lg:justify-center lg:px-0 justify-start gap-3 px-3"
                        : "justify-start gap-3 px-3"
                    )}
                    title={collapsed ? label : undefined}
                  >
                    <Link to={to}>
                      {/* Active indicator - left border */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                      )}
                      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                      <span className={cn("truncate", collapsed && "lg:hidden")}>{label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3 shrink-0">
          {/* Collapsed desktop: avatar only + dropdown */}
          <div className={cn("hidden", collapsed && "lg:flex lg:flex-col lg:items-center")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 p-0 rounded-full hover:bg-muted">
                  <Avatar className="size-9 border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" />
                  Aydınlık
                  {theme === "light" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" />
                  Karanlık
                  {theme === "dark" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 size-4" />
                  Sistem
                  {theme === "system" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 size-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Expanded (mobile always, desktop when not collapsed) */}
          <div className={cn(collapsed && "lg:hidden")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-auto px-2 py-2 justify-start gap-2 hover:bg-muted"
                >
                  <Avatar className="size-9 border shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold truncate leading-tight">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronUp className="size-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" />
                  Aydınlık Tema
                  {theme === "light" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" />
                  Karanlık Tema
                  {theme === "dark" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 size-4" />
                  Sistem Teması
                  {theme === "system" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 size-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Logout Alert Dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Çıkış yapmak istiyor musunuz?</AlertDialogTitle>
            <AlertDialogDescription>
              Oturumunuz sonlandırılacak. Tekrar giriş yapmanız gerekecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>Çıkış Yap</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMobileClose = useCallback(() => setMobileOpen(false), [])

  return (
    <AuthProvider>
      <div className="min-h-screen flex">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={handleMobileClose}
          />
        )}

        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile top bar */}
          <header className="h-14 border-b bg-card flex items-center px-4 gap-3 lg:hidden sticky top-0 z-20 shrink-0">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setMobileOpen(true)}>
              <Menu className="size-4" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={wernaLogo} alt="Werna" className="h-6 w-auto" />
              <span className="text-base font-bold tracking-tight">Werna</span>
            </div>
          </header>

          <main className="flex-1 bg-background overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <OnboardingDialog />
    </AuthProvider>
  )
}
