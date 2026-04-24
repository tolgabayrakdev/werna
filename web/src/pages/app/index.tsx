export default function AppIndex() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Hoş geldiniz, burası ana sayfanız.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-card rounded-lg border p-6">
                    <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                    <p className="text-3xl font-semibold mt-1">1,234</p>
                </div>
                <div className="bg-card rounded-lg border p-6">
                    <p className="text-sm text-muted-foreground">Aktif Projeler</p>
                    <p className="text-3xl font-semibold mt-1">42</p>
                </div>
                <div className="bg-card rounded-lg border p-6">
                    <p className="text-sm text-muted-foreground">Tamamlanan Görevler</p>
                    <p className="text-3xl font-semibold mt-1">856</p>
                </div>
            </div>
        </div>
    )
}