import { useEffect, useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  AlertCircle,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react"
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
  complaint: { label: "Şikayet", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-200 dark:border-red-900/50", bar: "bg-red-500" },
  suggestion: { label: "Öneri", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200 dark:border-amber-900/50", bar: "bg-amber-500" },
  request: { label: "İstek", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200 dark:border-blue-900/50", bar: "bg-blue-500" },
  compliment: { label: "Tebrik", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-900/50", bar: "bg-emerald-500" },
} as const

const FILTERS = [
  { value: "all", label: "Tümü" },
  { value: "complaint", label: "Şikayet" },
  { value: "suggestion", label: "Öneri" },
  { value: "request", label: "İstek" },
  { value: "compliment", label: "Tebrik" },
]

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState("all")
  const [page, setPage] = useState(1)

  const load = useCallback((t: string, p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: "20" })
    if (t !== "all") params.set("type", t)
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
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Geri Bildirimler</h1>
          <p className="text-sm text-muted-foreground mt-1">Müşterilerinizden gelen doğrulanmış geri bildirimler</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-1.5">
          Toplam {pagination.total} geri bildirim
        </div>
      </div>

      {/* Filters */}
      <Tabs value={type} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="h-9 bg-muted/60 p-1">
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f.value}
              value={f.value}
              className="text-xs px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {f.value !== "all" && (
                (() => {
                  const cfg = TYPE_CONFIG[f.value as keyof typeof TYPE_CONFIG]
                  const Icon = cfg.icon
                  return <Icon className={cn("size-3.5 mr-1.5", cfg.color)} />
                })()
              )}
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">Geri bildirim yok</p>
              <p className="text-xs mt-1">
                {type !== "all" ? "Bu filtreyle eşleşen geri bildirim bulunamadı" : "Henüz geri bildirim alınmamış"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => {
            const cfg = TYPE_CONFIG[fb.type]
            const Icon = cfg.icon
            return (
              <Card
                key={fb.id}
                className={cn(
                  "overflow-hidden transition-shadow hover:shadow-md",
                  cfg.border
                )}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                        <Icon className={cn("size-4", cfg.color)} />
                      </div>
                      <div>
                        <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                        <p className="text-xs text-muted-foreground">{fb.link_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {new Date(fb.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 tabular-nums">
                        {new Date(fb.created_at).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{fb.message}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{fb.customer_email}</span>
                    <span className="text-[11px] text-muted-foreground/60 font-mono">/f/{fb.link_slug}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - page) <= 1
              )
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === "number" && p - (arr[idx - 1] as number) > 1) {
                  acc.push("...")
                }
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                typeof p === "string" ? (
                  <span key={`dots-${i}`} className="text-xs text-muted-foreground px-1">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className="size-8 text-xs"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}
          </div>
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
