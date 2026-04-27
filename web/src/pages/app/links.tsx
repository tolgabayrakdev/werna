import { useEffect, useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Plus, Copy, QrCode, Trash2, ExternalLink, X, Download } from "lucide-react"
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
    toast.success("Link kopyalandı")
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bağlantılar</h1>
          <p className="text-sm text-muted-foreground mt-1">Müşterilerinize göndermek için geri bildirim linkleri oluşturun</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="size-4" />
          Yeni Bağlantı
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Yeni Bağlantı Oluştur</h2>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowCreate(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={handleCreate} className="flex gap-3">
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
            <div className="flex items-end">
              <Button type="submit" disabled={creating} className="gap-2">
                {creating ? <Spinner /> : <Plus className="size-4" />}
                Oluştur
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Links list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Spinner className="size-5" />
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center gap-3 text-muted-foreground border rounded-xl bg-card">
          <QrCode className="size-8 opacity-40" />
          <div>
            <p className="text-sm font-medium">Henüz bağlantı yok</p>
            <p className="text-xs mt-1">Müşterileriniz için ilk bağlantıyı oluşturun</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                  /f/{link.slug}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title="Linki aç"
                  onClick={() => window.open(linkUrl(link.slug), "_blank")}
                >
                  <ExternalLink className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title="Kopyala"
                  onClick={() => copyLink(link.slug)}
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title="QR Kod"
                  onClick={() => setQrTarget(link)}
                >
                  <QrCode className="size-3.5" />
                </Button>
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
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setQrTarget(null)}
        >
          <div className="bg-card rounded-2xl border shadow-xl p-8 space-y-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{qrTarget.name}</h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">/f/{qrTarget.slug}</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setQrTarget(null)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG
                ref={qrRef}
                value={linkUrl(qrTarget.slug)}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground font-mono flex-1 truncate">{linkUrl(qrTarget.slug)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={() => copyLink(qrTarget.slug)}
                >
                  <Copy className="size-3" />
                </Button>
              </div>
              <Button className="w-full gap-2" onClick={downloadQR}>
                <Download className="size-4" />
                QR İndir (PNG)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
