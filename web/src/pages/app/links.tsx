import { useEffect, useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Plus,
  Copy,
  QrCode,
  Trash2,
  ExternalLink,
  X,
  Download,
  Link2,
  CheckCircle2,
} from "lucide-react"

interface FeedbackLink {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
}

interface CreateLinkRes {
  success: boolean
  data: FeedbackLink
}

interface GetLinksRes {
  success: boolean
  data: FeedbackLink[]
}

function linkUrl(slug: string) {
  return `${window.location.origin}/f/${slug}`
}

export default function LinksPage() {
  const [links, setLinks] = useState<FeedbackLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [qrTarget, setQrTarget] = useState<FeedbackLink | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const qrRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    apiClient
      .get<GetLinksRes>("/api/feedback/links")
      .then((res) => setLinks(res.data))
      .catch(() => toast.error("Bağlantılar yüklenemedi"))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await apiClient.post<CreateLinkRes>("/api/feedback/links", { name: newName.trim() })
      setLinks((prev) => [res.data, ...prev])
      setNewName("")
      setShowCreate(false)
      toast.success("Bağlantı oluşturuldu")
    } catch (err) {
      toast.error(err instanceof ApiClientError ? (err.data.message ?? "Oluşturulamadı") : "Bir hata oluştu")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" bağlantısını silmek istediğinizden emin misiniz?`)) return
    try {
      await apiClient.delete(`/api/feedback/links/${id}`)
      setLinks((prev) => prev.filter((l) => l.id !== id))
      if (qrTarget?.id === id) setQrTarget(null)
      toast.success("Bağlantı silindi")
    } catch {
      toast.error("Bağlantı silinemedi")
    }
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(linkUrl(slug))
    setCopiedSlug(slug)
    toast.success("Link kopyalandı")
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const downloadQR = () => {
    if (!qrRef.current || !qrTarget) return
    const svg = qrRef.current
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement("a")
      a.download = `qr-${qrTarget.slug}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const activeCount = links.filter((l) => l.is_active).length

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bağlantılar</h1>
          <p className="text-sm text-muted-foreground mt-1">Müşterilerinize göndermek için geri bildirim linkleri oluşturun</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Yeni Bağlantı
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toplam Link</p>
              <p className="text-xl font-bold">{loading ? <Skeleton className="h-7 w-12" /> : links.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Aktif</p>
              <p className="text-xl font-bold">{loading ? <Skeleton className="h-7 w-12" /> : activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <QrCode className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">QR Oluşturulabilir</p>
              <p className="text-xl font-bold">{loading ? <Skeleton className="h-7 w-12" /> : links.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Yeni Bağlantı Oluştur</CardTitle>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowCreate(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="linkName">Bağlantı Adı</Label>
                <Input
                  id="linkName"
                  placeholder="ör: Masa QR, Kasa Yanı, WhatsApp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating ? <Spinner /> : <Plus className="size-4" />}
                Oluştur
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Links list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-8 w-8" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <QrCode className="size-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">Henüz bağlantı yok</p>
              <p className="text-xs mt-1">Müşterileriniz için ilk bağlantıyı oluşturun</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card
              key={link.id}
              className="overflow-hidden transition-shadow hover:shadow-md group"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{link.name}</p>
                    {link.is_active && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground font-mono truncate">/f/{link.slug}</p>
                    <span className="text-[11px] text-muted-foreground/50">
                      {new Date(link.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    title="Linki aç"
                    onClick={() => window.open(linkUrl(link.slug), "_blank")}
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    title="Kopyala"
                    onClick={() => copyLink(link.slug)}
                  >
                    {copiedSlug === link.slug ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    title="QR Kod"
                    onClick={() => setQrTarget(link)}
                  >
                    <QrCode className="size-3.5" />
                  </Button>
                  <Separator orientation="vertical" className="h-5 mx-0.5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Sil"
                    onClick={() => handleDelete(link.id, link.name)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setQrTarget(null)}
        >
          <Card className="w-full max-w-sm shadow-2xl border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{qrTarget.name}</CardTitle>
                  <CardDescription className="font-mono text-[11px]">/f/{qrTarget.slug}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setQrTarget(null)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center p-5 bg-white rounded-xl border">
                <QRCodeSVG
                  ref={qrRef}
                  value={linkUrl(qrTarget.slug)}
                  size={220}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
                  <p className="text-xs text-muted-foreground font-mono flex-1 truncate">{linkUrl(qrTarget.slug)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0"
                    onClick={() => copyLink(qrTarget.slug)}
                  >
                    {copiedSlug === qrTarget.slug ? (
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
                <Button className="w-full gap-2" onClick={downloadQR}>
                  <Download className="size-4" />
                  QR İndir (PNG)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
