import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"

export default function Settings() {
    const { user } = useAuthStore()

    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Ayarlar</h1>
                <p className="text-muted-foreground">Hesap ayarlarınızı yönetin.</p>
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">Profil Bilgileri</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input id="username" defaultValue={user?.username} className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input id="email" type="email" defaultValue={user?.email} className="h-10" />
                        </div>
                    </div>
                    <Button>Değişiklikleri Kaydet</Button>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <h2 className="text-lg font-medium">Şifre Değiştir</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                            <Input id="currentPassword" type="password" className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Yeni Şifre</Label>
                            <Input id="newPassword" type="password" className="h-10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                            <Input id="confirmPassword" type="password" className="h-10" />
                        </div>
                    </div>
                    <Button>Şifreyi Güncelle</Button>
                </div>
            </div>
        </div>
    )
}