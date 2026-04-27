import { useEffect, useState } from "react"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { MessageSquare, ThumbsUp, AlertCircle, Lightbulb, Star, TrendingUp } from "lucide-react"
import { useCurrentUser } from "@/store/auth-store"

interface TypeCount { type: string; count: string }
interface AnalyticsData {
  allTime: TypeCount[]
  thisWeek: TypeCount[]
  thisMonth: TypeCount[]
  thisYear: TypeCount[]
  monthly: { month: string; type: string; count: string }[]
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof MessageSquare; color: string; bg: string }> = {
  complaint: { label: "Şikayet", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  suggestion: { label: "Öneri", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  request: { label: "İstek", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  compliment: { label: "Tebrik", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
}

function sumCounts(rows: TypeCount[]) {
  return rows.reduce((acc, r) => acc + parseInt(r.count), 0)
}

function getCount(rows: TypeCount[], type: string) {
  return parseInt(rows.find((r) => r.type === type)?.count ?? "0")
}

export default function AppIndex() {
  const user = useCurrentUser()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: AnalyticsData }>("/api/feedback/analytics")
      .then((res) => setAnalytics(res.data))
      .catch((err) => {
        if (err instanceof ApiClientError && err.status !== 401) {
          console.error(err)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const totalAll = analytics ? sumCounts(analytics.allTime) : 0
  const totalWeek = analytics ? sumCounts(analytics.thisWeek) : 0
  const totalMonth = analytics ? sumCounts(analytics.thisMonth) : 0

  // Build monthly chart data (last 6 months)
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hoş geldiniz{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Geri bildirim analizinize genel bakış</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Toplam Geri Bildirim", value: totalAll, sub: "Tüm zamanlar", icon: Star, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Bu Hafta", value: totalWeek, sub: "Son 7 gün", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Bu Ay", value: totalMonth, sub: new Date().toLocaleDateString("tr-TR", { month: "long" }), icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Tebrik Oranı", value: analytics ? `${Math.round((getCount(analytics.allTime, "compliment") / Math.max(totalAll, 1)) * 100)}%` : "—", sub: "Tüm zamanlar", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className={cn("size-9 rounded-lg flex items-center justify-center", bg)}>
                <Icon className={cn("size-4", color)} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {loading ? <span className="text-muted-foreground">—</span> : value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Monthly bar chart */}
        <div className="lg:col-span-3 bg-card rounded-xl border p-6">
          <h2 className="text-base font-medium mb-6">Aylık Geri Bildirim</h2>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Yükleniyor...</div>
          ) : monthlyChartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Henüz veri yok</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthlyChartData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-t relative group cursor-default"
                    style={{ height: `${Math.round((d.total / maxMonthly) * 128)}px`, minHeight: "4px" }}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 bg-primary rounded-t transition-all"
                      style={{ height: `${Math.round((d.total / maxMonthly) * 128)}px`, minHeight: "4px" }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border rounded px-1.5 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      {d.total}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type breakdown */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-6">
          <h2 className="text-base font-medium mb-4">Tür Dağılımı</h2>
          <div className="space-y-3">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const count = analytics ? getCount(analytics.allTime, type) : 0
              const pct = totalAll > 0 ? Math.round((count / totalAll) * 100) : 0
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <cfg.icon className={cn("size-3.5", cfg.color)} />
                      {cfg.label}
                    </span>
                    <span className="font-medium tabular-nums">{loading ? "—" : count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", cfg.bg.replace("/10", ""))}
                      style={{ width: loading ? "0%" : `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* This year highlight */}
          {analytics && (
            <div className="mt-6 pt-4 border-t space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bu Yıl</p>
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                const count = getCount(analytics.thisYear, type)
                if (count === 0) return null
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className={cn("flex items-center gap-1.5", cfg.color)}>
                      <cfg.icon className="size-3" />
                      {cfg.label}
                    </span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                )
              })}
              {sumCounts(analytics.thisYear) === 0 && (
                <p className="text-xs text-muted-foreground">Henüz geri bildirim yok</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
