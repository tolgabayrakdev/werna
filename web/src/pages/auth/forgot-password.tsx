import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiClient, ApiClientError } from "@/lib/api-client"

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post("/api/auth/resend-verification", { email })
      setSent(true)
      toast.success("Doğrulama kodu gönderildi")
    } catch (error) {
      const message = error instanceof ApiClientError ? error.data.message : "Kod gönderilemedi"
      toast.error(message || "Kod gönderilemedi")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Werna</h1>
            <p className="text-primary-foreground/70 mt-2">Şifre sıfırlama</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight">
              Kodunuz<br />gönderildi!
            </h2>
            <p className="text-primary-foreground/70 max-w-md">
              E-posta adresinize bir doğrulama kodu gönderildi.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/50">© 2024 Werna. Tüm hakları saklıdır.</p>
        </div>

        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="lg:hidden text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Werna</h1>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">E-posta gönderildi</h2>
              <p className="text-sm text-muted-foreground">
                {email} adresine doğrulama kodu gönderildi.
              </p>
            </div>

            <div className="space-y-4">
              <Link to={`/verify-email?email=${encodeURIComponent(email)}`}>
                <Button className="w-full h-11">Doğrulama sayfasına git</Button>
              </Link>

              <Button variant="ghost" className="w-full" onClick={() => setSent(false)}>
                Farklı e-posta kullan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Werna</h1>
          <p className="text-primary-foreground/70 mt-2">Şifre sıfırlama</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold leading-tight">
            Şifrenizi mi<br />unuttunuz?
          </h2>
          <p className="text-primary-foreground/70 max-w-md">
            Endişelenmeyin, e-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">© 2024 Werna. Tüm hakları saklıdır.</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Werna</h1>
            <p className="text-sm text-muted-foreground mt-1">Şifre sıfırlama</p>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Şifremi Unuttum</h2>
            <p className="text-sm text-muted-foreground">
              Şifrenizi sıfırlamak için e-posta adresinizi girin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
            </Button>
          </form>

          <div className="flex items-center justify-center">
            <Link to="/sign-in" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Giriş sayfasına dön
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link to="/sign-up" className="text-primary font-medium hover:underline">
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}