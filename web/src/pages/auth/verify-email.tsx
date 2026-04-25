import { useState } from "react"
import { useNavigate, Link, useSearchParams } from "react-router"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiClient, ApiClientError } from "@/lib/api-client"

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post("/api/auth/verify", { email, code })
      toast.success("E-posta doğrulandı! Şimdi giriş yapabilirsiniz.")
      navigate("/sign-in")
    } catch (error) {
      const message = error instanceof ApiClientError ? error.data.message : "Doğrulama başarısız"
      toast.error(message || "Doğrulama başarısız")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await apiClient.post("/api/auth/resend-verification", { email })
      toast.success("Yeni kod gönderildi")
    } catch (error) {
      const message = error instanceof ApiClientError ? error.data.message : "Kod gönderilemedi"
      toast.error(message || "Kod gönderilemedi")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Werna</h1>
          <p className="text-primary-foreground/70 mt-2">E-posta doğrulama</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold leading-tight">
            Hesabınızı<br />doğrulayın
          </h2>
          <p className="text-primary-foreground/70 max-w-md">
            E-posta adresinize gönderilen doğrulama kodunu girin.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">© 2024 Werna. Tüm hakları saklıdır.</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Werna</h1>
            <p className="text-sm text-muted-foreground mt-1">E-posta doğrulama</p>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Doğrulama Kodu</h2>
            <p className="text-sm text-muted-foreground">
              {email} adresine gönderilen 6 haneli kodu girin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Doğrulama Kodu</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                className="h-11 text-center text-lg tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Doğrulanıyor..." : "Doğrula"}
            </Button>

            <div className="flex items-center justify-between">
              <Button variant="ghost" type="button" onClick={handleResend} disabled={resending}>
                {resending ? "Gönderiliyor..." : "Kodu yeniden gönder"}
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-center">
            <Link to="/sign-in" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}