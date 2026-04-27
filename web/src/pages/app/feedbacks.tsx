import { useEffect, useState, useCallback, useMemo, Fragment } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  AlertCircle,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Inbox,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  SortDesc,
  SortAsc,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

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

interface TypeCount {
  type: string
  count: string
}
interface AnalyticsData {
  allTime: TypeCount[]
  thisWeek: TypeCount[]
  thisMonth: TypeCount[]
  thisYear: TypeCount[]
  monthly: { month: string; type: string; count: string }[]
}

const TYPE_CONFIG = {
  complaint: { label: "Şikayet", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", fill: "#ef4444" },
  suggestion: { label: "Öneri", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", fill: "#f59e0b" },
  request: { label: "İstek", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", fill: "#3b82f6" },
  compliment: { label: "Tebrik", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", fill: "#10b981" },
} as const

const TYPE_FILTERS = [
  { value: "all", label: "Tüm Türler" },
  { value: "complaint", label: "Şikayet" },
  { value: "suggestion", label: "Öneri" },
  { value: "request", label: "İstek" },
  { value: "compliment", label: "Tebrik" },
]

const DATE_FILTERS = [
  { value: "all", label: "Tüm Zamanlar" },
  { value: "today", label: "Bugün" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
  { value: "year", label: "Bu Yıl" },
]

function sumCounts(rows: TypeCount[]) {
  return rows.reduce((acc, r) => acc + parseInt(r.count), 0)
}

function getCount(rows: TypeCount[], type: string) {
  return parseInt(rows.find((r) => r.type === type)?.count ?? "0")
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  }
}

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [type, setType] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [search, setSearch] = useState("")
  const [dateRange, setDateRange] = useState("all")
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback((t: string, p: number, lim: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(lim) })
    if (t !== "all") params.set("type", t)
    apiClient
      .get<FeedbacksRes>(`/api/feedback?${params}`)
      .then((res) => {
        setFeedbacks(res.data)
        setPagination(res.pagination)
        setExpandedId(null)
      })
      .catch(() => toast.error("Geri bildirimler yüklenemedi"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(type, page, limit)
  }, [load, type, page, limit])

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: AnalyticsData }>("/api/feedback/analytics")
      .then((res) => setAnalytics(res.data))
      .catch(() => {})
  }, [])

  const handleTypeChange = (t: string) => {
    setType(t)
    setPage(1)
  }

  const handleLimitChange = (v: string) => {
    setLimit(Number(v))
    setPage(1)
  }

  const hasActiveFilters = search.trim() !== "" || dateRange !== "all" || sortDir !== "desc"

  const clearFilters = () => {
    setSearch("")
    setDateRange("all")
    setSortDir("desc")
  }

  // Client-side filter + sort on the current page's data
  const displayed = useMemo(() => {
    let result = [...feedbacks]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (fb) =>
          fb.customer_email.toLowerCase().includes(q) ||
          fb.message.toLowerCase().includes(q) ||
          fb.link_name.toLowerCase().includes(q)
      )
    }

    if (dateRange !== "all") {
      const now = new Date()
      const cutoff = new Date()
      if (dateRange === "today") {
        cutoff.setHours(0, 0, 0, 0)
      } else if (dateRange === "week") {
        cutoff.setDate(now.getDate() - 7)
      } else if (dateRange === "month") {
        cutoff.setFullYear(now.getFullYear(), now.getMonth(), 1)
        cutoff.setHours(0, 0, 0, 0)
      } else if (dateRange === "year") {
        cutoff.setFullYear(now.getFullYear(), 0, 1)
        cutoff.setHours(0, 0, 0, 0)
      }
      result = result.filter((fb) => new Date(fb.created_at) >= cutoff)
    }

    result.sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return sortDir === "desc" ? diff : -diff
    })

    return result
  }, [feedbacks, search, dateRange, sortDir])

  const totalAll = analytics ? sumCounts(analytics.allTime) : 0
  const totalWeek = analytics ? sumCounts(analytics.thisWeek) : 0
  const totalMonth = analytics ? sumCounts(analytics.thisMonth) : 0

  const pieData = Object.entries(TYPE_CONFIG)
    .map(([t, cfg]) => ({
      name: cfg.label,
      value: analytics ? getCount(analytics.allTime, t) : 0,
      fill: cfg.fill,
    }))
    .filter((d) => d.value > 0)

  const monthlyData = (() => {
    if (!analytics) return []
    const months: Record<string, number> = {}
    analytics.monthly.forEach(({ month, count }) => {
      months[month] = (months[month] ?? 0) + parseInt(count)
    })
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        name: new Date(month + "-01").toLocaleDateString("tr-TR", { month: "short" }),
        total,
      }))
  })()

  const stats = [
    { label: "Toplam", value: totalAll, icon: BarChart3 },
    {
      label: "Bu Hafta",
      value: totalWeek,
      icon: TrendingUp,
      trend: (totalWeek >= totalMonth - totalWeek ? "up" : "down") as "up" | "down",
    },
    { label: "Bu Ay", value: totalMonth, icon: Clock },
    { label: "Tebrik", value: analytics ? getCount(analytics.allTime, "compliment") : 0, icon: ThumbsUp },
  ]

  const clientFilterActive = search.trim() !== "" || dateRange !== "all"

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Geri Bildirimler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Müşterilerinizden gelen doğrulanmış geri bildirimler
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-1.5">
          <BarChart3 className="size-3.5" />
          Toplam {pagination.total.toLocaleString("tr-TR")} kayıt
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <Card key={label} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold">
                    {loading && analytics === null ? (
                      <Skeleton className="h-7 w-12 inline-block" />
                    ) : (
                      value.toLocaleString("tr-TR")
                    )}
                  </p>
                  {trend &&
                    (trend === "up" ? (
                      <TrendingUp className="size-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3 text-red-500" />
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-1">Tür Dağılımı</h3>
            <p className="text-xs text-muted-foreground mb-4">Tüm zamanların geri bildirim türleri</p>
            {loading && analytics === null ? (
              <div className="h-56 flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                Henüz veri yok
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(value, name) => [`${value} adet`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-1">Aylık Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Son 6 aylık geri bildirim sayısı</p>
            {loading && analytics === null ? (
              <div className="h-56 flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                Henüz veri yok
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <ReTooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.6 }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                      itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
                      formatter={(value) => [`${value} geri bildirim`, "Toplam"]}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {/* Search row */}
        <div className="relative flex items-center border-b">
          <Search className="absolute left-4 size-4 text-muted-foreground pointer-events-none shrink-0" />
          <Input
            placeholder="E-posta, mesaj veya link adında ara..."
            className="pl-11 h-11 bg-transparent border-0 shadow-none rounded-none focus-visible:ring-0 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearch("")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/20">
          {/* Type */}
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger size="sm" className="w-auto h-7 border-0 bg-background text-xs gap-1.5 px-2.5 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range */}
          <Select value={dateRange} onValueChange={(v) => setDateRange(v)}>
            <SelectTrigger size="sm" className="w-auto h-7 border-0 bg-background text-xs gap-1.5 px-2.5 shadow-sm">
              <Clock className="size-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs border-0 bg-background shadow-sm",
              sortDir === "asc" && "text-primary"
            )}
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            {sortDir === "desc" ? (
              <SortDesc className="size-3.5" />
            ) : (
              <SortAsc className="size-3.5" />
            )}
            {sortDir === "desc" ? "En Yeni" : "En Eski"}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              <X className="size-3" />
              Temizle
            </Button>
          )}

          <div className="ml-auto flex items-center gap-3">
            {clientFilterActive && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {displayed.length.toLocaleString("tr-TR")} / {feedbacks.length.toLocaleString("tr-TR")} sonuç
              </span>
            )}
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger size="sm" className="w-auto h-7 border-0 bg-background text-xs gap-1.5 px-2.5 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="25">25 / sayfa</SelectItem>
                <SelectItem value="50">50 / sayfa</SelectItem>
                <SelectItem value="100">100 / sayfa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/20">
            <div className="flex gap-6">
              {["w-16", "flex-1", "w-24", "w-28", "w-20"].map((w, i) => (
                <Skeleton key={i} className={cn("h-4", w)} />
              ))}
            </div>
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0">
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-4 w-28 shrink-0" />
              <Skeleton className="h-4 w-20 shrink-0" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-52 gap-3 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">Geri bildirim bulunamadı</p>
              <p className="text-xs mt-1">
                {search || dateRange !== "all" || type !== "all"
                  ? "Bu filtrelerle eşleşen kayıt yok — filtreleri değiştirmeyi deneyin"
                  : "Henüz geri bildirim alınmamış"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30 border-b">
                  <TableHead className="w-[110px] pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tür
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mesaj
                  </TableHead>
                  <TableHead className="w-[150px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Link
                  </TableHead>
                  <TableHead className="w-[190px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    E-posta
                  </TableHead>
                  <TableHead className="w-[140px] pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <button
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                    >
                      Tarih
                      {sortDir === "desc" ? (
                        <ChevronDown className="size-3" />
                      ) : (
                        <ChevronUp className="size-3" />
                      )}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.map((fb) => {
                  const cfg = TYPE_CONFIG[fb.type]
                  const Icon = cfg.icon
                  const dt = formatDateTime(fb.created_at)
                  const isExpanded = expandedId === fb.id
                  return (
                    <Fragment key={fb.id}>
                      <TableRow
                        className={cn(
                          "cursor-pointer transition-colors select-none",
                          isExpanded && "bg-muted/30"
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                      >
                        <TableCell className="pl-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-0 font-medium gap-1 text-[11px] px-2 h-5",
                              cfg.bg,
                              cfg.color
                            )}
                          >
                            <Icon className="size-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <p className="text-sm text-foreground/80 truncate max-w-[300px]">
                            {fb.message}
                          </p>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs text-muted-foreground font-mono">/f/{fb.link_slug}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs text-muted-foreground truncate block max-w-[170px]">
                            {fb.customer_email}
                          </span>
                        </TableCell>
                        <TableCell className="pr-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs tabular-nums">{dt.date}</p>
                              <p className="text-[11px] text-muted-foreground/60 tabular-nums">{dt.time}</p>
                            </div>
                            <ChevronDown
                              className={cn(
                                "size-3.5 text-muted-foreground/40 transition-transform shrink-0",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="hover:bg-transparent bg-muted/10 border-b border-dashed">
                          <TableCell colSpan={5} className="px-6 pb-4 pt-2">
                            <div className="pl-3 border-l-2 border-primary/30 space-y-2">
                              <p className="text-sm leading-relaxed text-foreground/90">{fb.message}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/60">{fb.customer_email}</span>
                                <span className="text-border">·</span>
                                <span>{fb.link_name}</span>
                                <span className="text-border">·</span>
                                <span className="tabular-nums">
                                  {dt.date} {dt.time}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && !clientFilterActive && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Sayfa {page} / {pagination.totalPages} &middot;{" "}
            {pagination.total.toLocaleString("tr-TR")} kayıt
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1
              )
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (
                  idx > 0 &&
                  typeof arr[idx - 1] === "number" &&
                  p - (arr[idx - 1] as number) > 1
                )
                  acc.push("...")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                typeof p === "string" ? (
                  <span key={`dots-${i}`} className="text-xs text-muted-foreground px-1">
                    ...
                  </span>
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
        </div>
      )}
    </div>
  )
}
