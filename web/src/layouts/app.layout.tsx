import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <LayoutDashboard className="size-5" />
          <span className="text-lg font-semibold">Werna</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </NavLink>
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 px-3 text-sm">
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="size-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}