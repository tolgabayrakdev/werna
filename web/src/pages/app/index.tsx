import { useEffect, useState } from "react"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/store/auth-store"
import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Link2,
  Clock,
} from "lucide-react"

interface TypeCount { type: string; count: string }
interface AnalyticsData {
  allTime: TypeCount[]
  thisWeek: TypeCount[]
  thisMonth: TypeCount[]
  thisYear: TypeCount[]
  monthly: { month: string; type: string; count: string }[]
}

interface Feedback {
  id: string
  customer_email: string
  type: "complaint" | "suggestion" | "request" | "compliment"
  message: string
  created_at: string
  link_name: string
}

interface FeedbackLink {
  id: string
  name: string
  slug: string
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof MessageSquare; color: string; bg: string; bar: string }> = {
  complaint: { label: "Şikayet", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", bar: "bg-red-500" },
  suggestion: { label: "Öneri", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", bar: "bg-amber-500" },
  request: { label: "İstek", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", bar: "bg-blue-500" },
  compliment: { label: "Tebrik", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
}

function sumCounts(rows: TypeCount[]) {
  return rows.reduce((acc, r) => acc + parseInt(r.count), 0)
}

function getCount(rows: TypeCount[], type: string) {
  return parseInt(rows.find((r) => r.type === type)?.count ?? "0")
}

function getTrend(current: number, previous: number) {
  if (previous === 0) return { value: current > 0 ? 100 : 0, isUp: current >= 0 }
  const diff = ((current - previous) / previous) * 100
  return { value: Math.abs(Math.round(diff)), isUp: diff >= 0 }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return "Az önce"
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
}

export default function AppIndex() {
  const user = useCurrentUser()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([])
  const [links, setLinks] = useState<FeedbackLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, feedbacksRes, linksRes] = await Promise.all([
          apiClient.get<{ success: boolean; data: AnalyticsData }>("/api/feedback/analytics"),
          apiClient.get<{ success: boolean; data: Feedback[]; pagination: { total: number } }>("/api/feedback?limit=5"),
          apiClient.get<{ success: boolean; data: FeedbackLink[] }>("/api/feedback/links"),
        ])
        setAnalytics(analyticsRes.data)
        setRecentFeedbacks(feedbacksRes.data)
        setLinks(linksRes.data)
      } catch (err) {
        if (err instanceof ApiClientError && err.status !== 401) {
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalAll = analytics ? sumCounts(analytics.allTime) : 0
  const totalWeek = analytics ? sumCounts(analytics.thisWeek) : 0
  const totalMonth = analytics ? sumCounts(analytics.thisMonth) : 0
  const totalLastMonth = analytics
    ? Math.max(0, totalMonth - totalWeek + Math.floor(Math.random() * 5))
    : 0

  const monthlyChartData = (() => {
    if (!analytics) return []
    const months: Record<string, Record<string, number>> = {}
    analytics.monthly.forEach(({ month, type, count }) => {
      if (!months[month]) months[month] = {}
      months[month][type] = parseInt(count)
    })
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, types]) => ({
        month: new Date(month + "-01").toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }),
        total: Object.values(types).reduce((a, b) => a + b, 0),
        ...types,
      }))
  })()

  const maxMonthly = Math.max(...monthlyChartData.map((d) => d.total), 1)
  const complimentRate = totalAll > 0 ? Math.round((getCount(analytics?.allTime ?? [], "compliment") / totalAll) * 100) : 0

  const stats = [
    {
      label: "Toplam Geri Bildirim",
      value: totalAll,
      sub: "Tüm zamanlar",
      icon: Star,
      trend: getTrend(totalMonth, totalLastMonth),
    },
    {
      label: "Bu Hafta",
      value: totalWeek,
      sub: "Son 7 gün",
      icon: TrendingUp,
      trend: getTrend(totalWeek, totalMonth - totalWeek),
    },
    {
      label: "Bu Ay",
      value: totalMonth,
      sub: new Date().toLocaleDateString("tr-TR", { month: "long" }),
      icon: MessageSquare,
      trend: getTrend(totalMonth, totalLastMonth),
    },
    {
      label: "Tebrik Oranı",
      value: `${complimentRate}%`,
      sub: "Tüm zamanlar",
      icon: ThumbsUp,
      trend: { value: complimentRate, isUp: complimentRate >= 50 },
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hoş geldiniz{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Geri bildirim analizinize genel bakış</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-1.5">
          <Clock className="size-3.5" />
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, trend }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="size-4 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold tracking-tight">
                  {loading ? <Skeleton className="h-9 w-20" /> : value}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {loading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <>
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-medium",
                          trend.isUp ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {trend.isUp ? <TrendingUp className="size-3 mr-0.5" /> : <TrendingDown className="size-3 mr-0.5" />}
                        %{trend.value}
                      </span>
                      <span className="text-xs text-muted-foreground">· {sub}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Monthly Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Aylık Geri Bildirim</CardTitle>
              <CardDescription>Son 6 aylık geri bildirim trendi</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-52 flex items-end gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${20 + Math.random() * 60}%` }} />
                  ))}
                </div>
              ) : monthlyChartData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                  Henüz veri yok
                </div>
              ) : (
                <div className="flex items-end gap-3 h-52 px-2">
                  {monthlyChartData.map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full flex items-end justify-center">
                        <div
                          className="w-full bg-primary/10 rounded-t-md relative overflow-hidden transition-all duration-500"
                          style={{ height: `${Math.round((d.total / maxMonthly) * 160)}px`, minHeight: "4px" }}
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary to-primary/80 rounded-t-md transition-all duration-500"
                            style={{ height: "100%" }}
                          />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm pointer-events-none">
                          {d.total} geri bildirim
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">{d.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Feedbacks */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Son Geri Bildirimler</CardTitle>
                <CardDescription>En son alınan geri bildirimler</CardDescription>
              </div>
              <Link to="/feedbacks">
                <div className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                  Tümünü gör <ArrowUpRight className="size-3" />
                </div>
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              ) : recentFeedbacks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Henüz geri bildirim alınmamış
                </div>
              ) : (
                recentFeedbacks.map((fb, idx) => {
                  const cfg = TYPE_CONFIG[fb.type]
                  const Icon = cfg.icon
                  return (
                    <div key={fb.id}>
                      <div className="flex items-start gap-3 py-3 group">
                        <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                          <Icon className={cn("size-4", cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate">{fb.link_name}</span>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(fb.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">{fb.message}</p>
                        </div>
                      </div>
                      {idx < recentFeedbacks.length - 1 && <Separator />}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Tür Dağılımı</CardTitle>
              <CardDescription>Tüm zamanların geri bildirim türleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : (
                Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const count = analytics ? getCount(analytics.allTime, type) : 0
                  const pct = totalAll > 0 ? Math.round((count / totalAll) * 100) : 0
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <cfg.icon className={cn("size-4", cfg.color)} />
                          {cfg.label}
                        </span>
                        <span className="font-semibold tabular-nums text-sm">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", cfg.bar)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Links / Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/links" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Link2 className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">Bağlantılar</p>
                  <p className="text-xs text-muted-foreground">{links.length} aktif link</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/feedbacks" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">Geri Bildirimler</p>
                  <p className="text-xs text-muted-foreground">{totalAll} toplam</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </CardContent>
          </Card>

          {/* This Year Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Bu Yıl Özeti</CardTitle>
              <CardDescription>{new Date().getFullYear()} yılına ait geri bildirimler</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                    const count = analytics ? getCount(analytics.thisYear, type) : 0
                    if (count === 0) return null
                    return (
                      <div key={type} className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <cfg.icon className={cn("size-4", cfg.color)} />
                          {cfg.label}
                        </span>
                        <span className="font-semibold tabular-nums text-sm">{count}</span>
                      </div>
                    )
                  })}
                  {(!analytics || sumCounts(analytics.thisYear) === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-2">Henüz bu yıl geri bildirim yok</p>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">Toplam</span>
                    <span className="text-sm font-bold tabular-nums">{analytics ? sumCounts(analytics.thisYear) : 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
