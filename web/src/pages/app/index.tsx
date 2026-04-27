import { useEffect, useState } from "react"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/store/auth-store"
import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Star,
  Calendar,
  Activity,
  SmilePlus,
} from "lucide-react"

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

interface Feedback {
  id: string
  customer_email: string
  type: "complaint" | "suggestion" | "request" | "compliment"
  message: string
  created_at: string
  link_name: string
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof MessageSquare; color: string; bg: string; fill: string }
> = {
  complaint: { label: "Şikayet", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", fill: "#ef4444" },
  suggestion: { label: "Öneri", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", fill: "#f59e0b" },
  request: { label: "İstek", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", fill: "#3b82f6" },
  compliment: { label: "Tebrik", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", fill: "#10b981" },
}

const STAT_CONFIGS = [
  { key: "total",  label: "Toplam", sub: "Tüm zamanlar", icon: Star,       accent: "text-violet-500", accentBg: "bg-violet-500/10" },
  { key: "week",   label: "Bu Hafta", sub: "Son 7 gün",  icon: Activity,   accent: "text-blue-500",   accentBg: "bg-blue-500/10"   },
  { key: "month",  label: "Bu Ay",    sub: "",            icon: Calendar,   accent: "text-amber-500",  accentBg: "bg-amber-500/10"  },
  { key: "year",   label: "Bu Yıl",   sub: "",            icon: TrendingUp, accent: "text-emerald-500",accentBg: "bg-emerald-500/10"},
]

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, feedbacksRes] = await Promise.all([
          apiClient.get<{ success: boolean; data: AnalyticsData }>("/api/feedback/analytics"),
          apiClient.get<{ success: boolean; data: Feedback[]; pagination: { total: number } }>(
            "/api/feedback?limit=5"
          ),
        ])
        setAnalytics(analyticsRes.data)
        setRecentFeedbacks(feedbacksRes.data)
      } catch (err) {
        if (err instanceof ApiClientError && err.status !== 401) console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalAll   = analytics ? sumCounts(analytics.allTime)   : 0
  const totalWeek  = analytics ? sumCounts(analytics.thisWeek)  : 0
  const totalMonth = analytics ? sumCounts(analytics.thisMonth) : 0
  const totalYear  = analytics ? sumCounts(analytics.thisYear)  : 0

  const totalCompliments = analytics ? getCount(analytics.allTime, "compliment") : 0
  const totalComplaints  = analytics ? getCount(analytics.allTime, "complaint")  : 0
  const satisfactionScore =
    totalCompliments + totalComplaints > 0
      ? Math.round((totalCompliments / (totalCompliments + totalComplaints)) * 100)
      : null

  const satisfactionLevel =
    satisfactionScore === null ? null
    : satisfactionScore >= 70 ? { label: "Mükemmel",        color: "text-emerald-600", barColor: "#10b981" }
    : satisfactionScore >= 45 ? { label: "Orta Düzey",       color: "text-amber-600",  barColor: "#f59e0b" }
    :                           { label: "Dikkat Gerekiyor", color: "text-red-600",    barColor: "#ef4444" }

  const monthlyChartData = (() => {
    if (!analytics) return []
    const months: Record<string, number> = {}
    analytics.monthly.forEach(({ month, count }) => {
      months[month] = (months[month] ?? 0) + parseInt(count)
    })
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        name: new Date(month + "-01").toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }),
        total,
      }))
  })()

  const totalLastMonth = monthlyChartData.length >= 2
    ? (monthlyChartData[monthlyChartData.length - 2]?.total ?? 0)
    : 0

  const statValues: Record<string, { value: number; trend: { value: number; isUp: boolean }; sub: string }> = {
    total: { value: totalAll,   trend: getTrend(totalMonth, totalLastMonth),            sub: "Tüm zamanlar" },
    week:  { value: totalWeek,  trend: getTrend(totalWeek, totalMonth - totalWeek),     sub: "Son 7 gün" },
    month: { value: totalMonth, trend: getTrend(totalMonth, totalLastMonth),            sub: new Date().toLocaleDateString("tr-TR", { month: "long" }) },
    year:  { value: totalYear,  trend: getTrend(totalYear, totalAll - totalYear),       sub: new Date().getFullYear().toString() },
  }

  const pieData = Object.entries(TYPE_CONFIG)
    .map(([type, cfg]) => ({
      name: cfg.label,
      value: analytics ? getCount(analytics.allTime, type) : 0,
      fill: cfg.fill,
    }))
    .filter((d) => d.value > 0)

  const totalYearSum = analytics ? sumCounts(analytics.thisYear) : 0

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Genel Bakış
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Hoş geldiniz{user?.name ? `, ${user.name}` : ""}
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-1.5">
          <Clock className="size-3.5" />
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Compact Satisfaction Strip */}
      <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3">
        <SmilePlus
          className={cn(
            "size-4 shrink-0",
            satisfactionLevel
              ? satisfactionLevel.color
              : "text-muted-foreground"
          )}
        />
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Memnuniyet Skoru
        </span>
        {loading ? (
          <Skeleton className="h-5 w-16" />
        ) : satisfactionScore === null ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <>
            <span className={cn("text-sm font-bold tabular-nums", satisfactionLevel?.color)}>
              %{satisfactionScore}
            </span>
            {satisfactionLevel && (
              <span className="text-xs text-muted-foreground">{satisfactionLevel.label}</span>
            )}
          </>
        )}

        {/* progress bar */}
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden mx-1">
          {!loading && satisfactionScore !== null && (
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${satisfactionScore}%`, backgroundColor: satisfactionLevel?.barColor }}
            />
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="text-emerald-600 font-medium tabular-nums">
            {loading ? "—" : `${totalCompliments.toLocaleString("tr-TR")} tebrik`}
          </span>
          <span className="text-border">·</span>
          <span className="text-red-500 font-medium tabular-nums">
            {loading ? "—" : `${totalComplaints.toLocaleString("tr-TR")} şikayet`}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CONFIGS.map(({ key, label, icon: Icon, accent, accentBg }) => {
          const sv = statValues[key]
          return (
            <Card key={key} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <div className={cn("size-7 rounded-lg flex items-center justify-center", accentBg)}>
                    <Icon className={cn("size-3.5", accent)} />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">
                  {loading ? (
                    <Skeleton className="h-8 w-16 inline-block" />
                  ) : (
                    sv.value.toLocaleString("tr-TR")
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {loading ? (
                    <Skeleton className="h-3.5 w-20" />
                  ) : (
                    <>
                      <span className={cn("inline-flex items-center text-xs font-medium", sv.trend.isUp ? "text-emerald-600" : "text-red-500")}>
                        {sv.trend.isUp ? <TrendingUp className="size-3 mr-0.5" /> : <TrendingDown className="size-3 mr-0.5" />}
                        %{sv.trend.value}
                      </span>
                      <span className="text-xs text-muted-foreground">· {sv.sub}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main grid: 3 left + 2 right */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Left column */}
        <div className="lg:col-span-3 space-y-5">

          {/* Monthly Trend */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">Aylık Geri Bildirim Trendi</CardTitle>
              <CardDescription className="text-xs">Son 6 aylık toplam geri bildirim sayısı</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : monthlyChartData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">Henüz veri yok</div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyChartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  style={{ stopColor: "var(--primary)", stopOpacity: "0.18" }} />
                          <stop offset="95%" style={{ stopColor: "var(--primary)", stopOpacity: "0" }} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                      <ReTooltip formatter={(v) => [`${v} geri bildirim`, "Toplam"]} />
                      <Area type="monotone" dataKey="total" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Feedbacks */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Son Geri Bildirimler</CardTitle>
                <CardDescription className="text-xs">En son alınan geri bildirimler</CardDescription>
              </div>
              <Link
                to="/feedbacks"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                Tümünü gör <ArrowUpRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-0.5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5">
                    <Skeleton className="size-7 rounded-lg shrink-0" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              ) : recentFeedbacks.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  Henüz geri bildirim alınmamış
                </div>
              ) : (
                recentFeedbacks.map((fb, idx) => {
                  const cfg = TYPE_CONFIG[fb.type]
                  const Icon = cfg.icon
                  return (
                    <div key={fb.id}>
                      <div className="flex items-start gap-3 py-2.5">
                        <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                          <Icon className={cn("size-3.5", cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium truncate">{fb.link_name}</span>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{formatDate(fb.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{fb.message}</p>
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

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Donut Chart */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">Tür Dağılımı</CardTitle>
              <CardDescription className="text-xs">Tüm zamanların geri bildirim türleri</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {loading ? (
                <div className="h-52 flex items-center justify-center">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
              ) : pieData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">Henüz veri yok</div>
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <ReTooltip formatter={(v, name) => [`${v} adet`, name]} />
                      <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Year Summary */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Bu Yıl Özeti</CardTitle>
                  <CardDescription className="text-xs">{new Date().getFullYear()} yılı dağılımı</CardDescription>
                </div>
                {!loading && totalYearSum > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md tabular-nums">
                    {totalYearSum.toLocaleString("tr-TR")}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {loading ? (
                <div className="space-y-3.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between"><Skeleton className="h-3.5 w-16" /><Skeleton className="h-3.5 w-8" /></div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : totalYearSum === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Henüz bu yıl geri bildirim yok</p>
              ) : (
                <div className="space-y-3.5">
                  {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                    const count = analytics ? getCount(analytics.thisYear, type) : 0
                    if (count === 0) return null
                    const pct = (count / totalYearSum) * 100
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cfg.fill }} />
                            {cfg.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground tabular-nums">%{Math.round(pct)}</span>
                            <span className="text-xs font-semibold tabular-nums w-7 text-right">{count}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.fill }} />
                        </div>
                      </div>
                    )
                  })}
                  <Separator className="mt-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Toplam</span>
                    <span className="text-xs font-bold tabular-nums">{totalYearSum.toLocaleString("tr-TR")}</span>
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
