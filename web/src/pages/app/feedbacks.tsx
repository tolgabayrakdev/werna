import { useEffect, useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertCircle, Lightbulb, MessageSquare, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feedback {
  id: string
  customer_email: string
  type: "complaint" | "suggestion" | "request" | "compliment"
  message: string
  created_at: string
  link_name: string
  link_slug: string
}

interface FeedbacksRes {
  success: boolean
  data: Feedback[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

const TYPE_CONFIG = {
  complaint: { label: "Şikayet", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-200 dark:border-red-900" },
  suggestion: { label: "Öneri", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-900" },
  request: { label: "İstek", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200 dark:border-blue-900" },
  compliment: { label: "Tebrik", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-900" },
} as const

const FILTERS = [
  { value: "", label: "Tümü" },
  { value: "complaint", label: "Şikayet" },
  { value: "suggestion", label: "Öneri" },
  { value: "request", label: "İstek" },
  { value: "compliment", label: "Tebrik" },
]

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState("")
  const [page, setPage] = useState(1)

  const load = useCallback((t: string, p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: "20" })
    if (t) params.set("type", t)
    apiClient
      .get<FeedbacksRes>(`/api/feedback?${params}`)
      .then((res) => {
        setFeedbacks(res.data)
        setPagination(res.pagination)
      })
      .catch(() => toast.error("Geri bildirimler yüklenemedi"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(type, page)
  }, [load, type, page])

  const handleTypeChange = (t: string) => {
    setType(t)
    setPage(1)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Geri Bildirimler</h1>
        <p className="text-sm text-muted-foreground mt-1">Müşterilerinizden gelen doğrulanmış geri bildirimler</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={type === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange(f.value)}
          >
            {f.value && (
              (() => {
                const cfg = TYPE_CONFIG[f.value as keyof typeof TYPE_CONFIG]
                const Icon = cfg.icon
                return <Icon className={cn("size-3.5 mr-1.5", type === f.value ? "text-primary-foreground" : cfg.color)} />
              })()
            )}
            {f.label}
          </Button>
        ))}
        {pagination.total > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            Toplam {pagination.total} geri bildirim
          </span>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner className="size-5" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground border rounded-xl bg-card">
          <MessageSquare className="size-8 opacity-40" />
          <div className="text-center">
            <p className="text-sm font-medium">Geri bildirim yok</p>
            <p className="text-xs mt-1">
              {type ? "Bu filtreyle eşleşen geri bildirim bulunamadı" : "Henüz geri bildirim alınmamış"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => {
            const cfg = TYPE_CONFIG[fb.type]
            const Icon = cfg.icon
            return (
              <div key={fb.id} className={cn("bg-card rounded-xl border p-5 space-y-3", cfg.border)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                      <Icon className={cn("size-3.5", cfg.color)} />
                    </div>
                    <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{fb.link_name}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(fb.created_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{fb.message}</p>
                <p className="text-xs text-muted-foreground">{fb.customer_email}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
