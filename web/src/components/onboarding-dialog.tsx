import { useEffect, useState } from "react"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import {
  MapPin,
  Globe,
  Phone,
  PartyPopper,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react"

interface BusinessProfileData {
  sector: string
  description: string
  phone: string
  website: string
  address: string
  city: string
  country: string
}

const INITIAL_DATA: BusinessProfileData = {
  sector: "",
  description: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  country: "",
}

function triggerConfetti() {
  const duration = 3 * 1000
  const end = Date.now() + duration
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export default function OnboardingDialog() {
  const user = useAuthStore((state) => state.user)
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "success">("form")
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<BusinessProfileData>(INITIAL_DATA)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (user && user.onboardingCompleted === false) {
      setOpen(true)
    }
  }, [user])

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: { profile: BusinessProfileData | null } }>(
          "/api/account/me/profile"
        )
        if (res.data.profile) {
          setFormData({
            sector: res.data.profile.sector ?? "",
            description: res.data.profile.description ?? "",
            phone: res.data.profile.phone ?? "",
            website: res.data.profile.website ?? "",
            address: res.data.profile.address ?? "",
            city: res.data.profile.city ?? "",
            country: res.data.profile.country ?? "",
          })
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post("/api/account/me/profile", {
        sector: formData.sector || undefined,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
      })
      await apiClient.patch("/api/account/me/profile/complete")
      setOnboardingCompleted(true)
      setStep("success")
      triggerConfetti()
    } catch (error) {
      const message = error instanceof ApiClientError ? error.data.message : "Bir hata oluştu"
      toast.error(message || "Bilgiler kaydedilemedi")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    // Do not allow closing unless onboarding is completed
    if (user?.onboardingCompleted === true) {
      setOpen(false)
    }
  }

  if (step === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md text-center" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce">
              <PartyPopper className="size-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-5 text-amber-500" />
                <h2 className="text-2xl font-bold tracking-tight">Artık Hazırsınız!</h2>
                <Sparkles className="size-5 text-amber-500" />
              </div>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                İşletme bilgileriniz başarıyla kaydedildi. Dashboard'a yönlendiriliyorsunuz...
              </p>
            </div>
            <Button onClick={() => { setOpen(false) }} className="w-full h-11 gap-2 mt-2">
              Dashboard'a Git
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>İşletmenizi Tanıyalım</DialogTitle>
          <DialogDescription>
            Platformu size özel hale getirmek için işletme bilgilerinizi girin. Bu adımı tamamlamadan dashboard'a erişemezsiniz.
          </DialogDescription>
        </DialogHeader>

        {!loaded ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sector">Sektör</Label>
                <Input
                  id="sector"
                  name="sector"
                  placeholder="Örn: Restoran, Mağaza, Teknoloji"
                  className="h-11"
                  value={formData.sector}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    Telefon
                  </span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+90 5xx xxx xx xx"
                  className="h-11"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="İşletmenizi kısaca tanıtın"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <span className="flex items-center gap-1.5">
                    <Globe className="size-3.5" />
                    Web Sitesi
                  </span>
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://ornek.com"
                  className="h-11"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Ülke</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="Türkiye"
                  className="h-11"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Şehir</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="İstanbul"
                  className="h-11"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    Adres
                  </span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Cadde, Sokak, No"
                  className="h-11"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="h-11 px-6" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Bitir"}
                {!saving && <ArrowRight className="ml-2 size-4" />}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
