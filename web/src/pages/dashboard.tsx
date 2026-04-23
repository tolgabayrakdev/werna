import { useAuth } from '@/hooks/use-auth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Kullanıcı Adı</h3>
          <p className="mt-1 text-lg font-semibold">{user?.username}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">E-posta</h3>
          <p className="mt-1 text-lg font-semibold">{user?.email}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Rol</h3>
          <p className="mt-1 text-lg font-semibold capitalize">{user?.role}</p>
        </div>
      </div>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">Hoş Geldiniz!</h3>
        <p className="mt-2 text-muted-foreground">
          Werna platformuna hoş geldiniz, {user?.username}. Sol menüden işlemlerinize devam edebilirsiniz.
        </p>
      </div>
    </div>
  );
}