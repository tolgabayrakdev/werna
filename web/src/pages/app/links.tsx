import { useEffect, useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
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
  Calendar,
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [qrTarget, setQrTarget] = useState<FeedbackLink | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const qrRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    apiClient
      .get<GetLinksRes>("/api/feedback/links")
      .then((res) => setLinks(res.data))
      .catch(() => toast.error("Could not load links"))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await apiClient.post<CreateLinkRes>("/api/feedback/links", {
        name: newName.trim(),
      })
      setLinks((prev) => [res.data, ...prev])
      setNewName("")
      setDialogOpen(false)
      toast.success("Link created")
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? (err.data.message ?? "Could not create") : "An error occurred"
      )
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await apiClient.delete(`/api/feedback/links/${id}`)
      setLinks((prev) => prev.filter((l) => l.id !== id))
      if (qrTarget?.id === id) setQrTarget(null)
      toast.success("Link deleted")
    } catch {
      toast.error("Could not delete link")
    }
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(linkUrl(slug))
    setCopiedSlug(slug)
    toast.success("Link copied")
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
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create feedback links to send to your customers
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" />
          New Link
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
              <p className="text-xs text-muted-foreground">Total Links</p>
              <p className="text-xl font-bold">
                {loading ? <Skeleton className="h-7 w-10 inline-block" /> : links.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">
                {loading ? <Skeleton className="h-7 w-10 inline-block" /> : activeCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <QrCode className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">QR Generatable</p>
              <p className="text-xl font-bold">
                {loading ? <Skeleton className="h-7 w-10 inline-block" /> : links.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setNewName("")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Create New Link</DialogTitle>
            <DialogDescription>
              Create a new feedback link to send to your customers. You can generate a QR code for each link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkName">Link Name</Label>
              <Input
                id="linkName"
                placeholder="e.g. Table QR, Counter, WhatsApp"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This name is only visible to you, customers will not see it.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={creating || !newName.trim()} className="gap-2">
                {creating ? <Spinner /> : <Plus className="size-4" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Links list */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-28 ml-auto" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-52 gap-4 text-muted-foreground">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
              <QrCode className="size-7 opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No links yet</p>
              <p className="text-xs mt-1">
                Create your first feedback link for your customers
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5" />
              Create First Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card divide-y">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors group">
              {/* Link info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{link.name}</p>
                  {link.is_active && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-muted-foreground font-mono">/f/{link.slug}</p>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <Calendar className="size-3" />
                    {new Date(link.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  title="Open link"
                  onClick={() => window.open(linkUrl(link.slug), "_blank")}
                >
                  <ExternalLink className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  title="Copy"
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
                  title="QR Code"
                  onClick={() => setQrTarget(link)}
                >
                  <QrCode className="size-3.5" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setQrTarget(null)}
        >
          <Card className="w-full max-w-sm shadow-2xl border-0">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-base">{qrTarget.name}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">/f/{qrTarget.slug}</p>
                </div>
                <Button variant="ghost" size="icon" className="size-8 -mt-1 -mr-1" onClick={() => setQrTarget(null)}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex justify-center p-6 bg-white rounded-xl border">
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
                  <p className="text-xs text-muted-foreground font-mono flex-1 truncate">
                    {linkUrl(qrTarget.slug)}
                  </p>
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
                  QR Download (PNG)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
