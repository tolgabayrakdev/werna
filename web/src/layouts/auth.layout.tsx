import { Outlet } from 'react-router';
import { LayoutDashboard } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <LayoutDashboard className="mb-2 size-8" />
          <h1 className="text-2xl font-bold">Werna</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}