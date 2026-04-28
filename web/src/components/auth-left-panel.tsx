import { QrCode, BarChart3, MessageSquareHeart } from "lucide-react"
import wernaLogo from "@/assets/werna_logo.svg"

const features = [
  {
    icon: QrCode,
    title: "Instant Feedback via QR",
    desc: "Customers can send anonymous feedback in 30 seconds by scanning a QR code",
  },
  {
    icon: MessageSquareHeart,
    title: "Smart Classification",
    desc: "Complaints, suggestions, requests, and compliments are automatically categorized",
  },
  {
    icon: BarChart3,
    title: "Advanced Feedback Analytics",
    desc: "Understand trends with in-depth charts, type breakdowns, and monthly performance insights",
  },
]

const stats = [
  { value: "500+", label: "Businesses" },
  { value: "50K+", label: "Feedback" },
  { value: "99.9%", label: "Uptime" },
]

interface AuthLeftPanelProps {
  heading: React.ReactNode
  description: string
}

export function AuthLeftPanel({ heading, description }: AuthLeftPanelProps) {
  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden bg-slate-950 p-12 text-white select-none">
      {/* Background blobs */}
      <div className="absolute -top-32 -right-32 size-[480px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 size-[180px] rounded-full bg-violet-500/15 blur-[60px] pointer-events-none" />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Horizontal rule accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src={wernaLogo} alt="Werna" className="h-8 w-auto brightness-0 invert" />
          <span className="text-lg font-semibold tracking-tight">Werna</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center gap-10">
          {/* Heading */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-3 py-1 text-[11px] font-medium text-white/60 tracking-wide">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Customer Feedback Platform
            </div>
            <h2 className="text-[2.4rem] font-bold leading-[1.15] tracking-tight">
              {heading}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-[290px]">
              {description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <Icon className="size-4 text-white/65" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none mb-1.5 text-white/90">{title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/8 rounded-xl p-3 text-center backdrop-blur-sm"
              >
                <p className="text-xl font-bold text-white/90 tracking-tight">{value}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/20">© 2026 Werna. All rights reserved.</p>
          <p className="text-[11px] text-white/20">werna.app</p>
        </div>
      </div>
    </div>
  )
}
