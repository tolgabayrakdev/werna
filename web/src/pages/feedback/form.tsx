import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { AlertCircle, Lightbulb, MessageSquare, ThumbsUp, CheckCircle2 } from "lucide-react"
import wernaLogo from "@/assets/werna_logo.svg"

interface LinkInfo { name: string; businessName: string; slug: string }

const TYPES = [
  { value: "complaint", label: "Complaint", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-300 dark:border-red-800", activeBg: "bg-red-500/15" },
  { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-300 dark:border-yellow-800", activeBg: "bg-yellow-500/15" },
  { value: "request", label: "Request", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-300 dark:border-blue-800", activeBg: "bg-blue-500/15" },
  { value: "compliment", label: "Compliment", icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-300 dark:border-emerald-800", activeBg: "bg-emerald-500/15" },
]

export default function FeedbackForm() {
  const { slug } = useParams<{ slug: string }>()
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<"form" | "verify" | "done">("form")

  const [form, setForm] = useState({
    customerEmail: "",
    type: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [feedbackId, setFeedbackId] = useState("")

  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!slug) return
    apiClient
      .get<{ success: boolean; data: LinkInfo }>(`/api/feedback/links/${slug}/info`)
      .then((res) => setLinkInfo(res.data))
      .catch(() => setNotFound(true))
  }, [slug])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type) return
    setSubmitting(true)
    try {
      const res = await apiClient.post<{ success: boolean; data: { feedbackId: string } }>(
        "/api/feedback/submit",
        { slug, ...form }
      )
      setFeedbackId(res.data.feedbackId)
      setCountdown(90)
      setStep("verify")
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.data.message : "Could not send"
      alert(msg ?? "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    try {
      await apiClient.post("/api/feedback/verify", { feedbackId, code })
      setStep("done")
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.data.message : "Verification failed"
      alert(msg ?? "An error occurred")
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await apiClient.post("/api/feedback/submit", { slug, ...form })
      setCountdown(90)
    } catch {
      alert("Code could not be resent")
    } finally {
      setResending(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <AlertCircle className="size-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Link not found</h1>
          <p className="text-sm text-muted-foreground">This feedback link is invalid or no longer active.</p>
        </div>
      </div>
    )
  }

  if (!linkInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Thank You!</h1>
            <p className="text-sm text-muted-foreground">
              Your feedback has been forwarded to <strong>{linkInfo.businessName}</strong>. Thank you for your valuable input.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-4">
            <img src={wernaLogo} alt="Werna" className="h-4 w-auto opacity-50" />
            <span>Sent via Werna</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <img src={wernaLogo} alt="Werna" className="h-8 w-auto mx-auto mb-4 opacity-70" />
            <h1 className="text-2xl font-semibold">Email Verification</h1>
            <p className="text-sm text-muted-foreground">
              A 6-digit verification code has been sent to <strong>{form.customerEmail}</strong>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                className="h-12 text-center text-xl tracking-[0.5em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={verifying || code.length < 6}>
              {verifying ? <Spinner className="mr-2" /> : null}
              {verifying ? "Verifying..." : "Submit Feedback"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
            {countdown > 0 && (
              <span className="text-muted-foreground tabular-nums">{countdown}s</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => { setStep("form"); setCode("") }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeftIcon />
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <img src={wernaLogo} alt="Werna" className="h-7 w-auto mx-auto mb-4 opacity-70" />
          <h1 className="text-2xl font-semibold">{linkInfo.businessName}</h1>
          <p className="text-sm text-muted-foreground">{linkInfo.name} · Feedback Form</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type selection */}
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(({ value, label, icon: Icon, color, bg, border, activeBg }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: value }))}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all text-left",
                    form.type === value
                      ? cn("border-2", border, activeBg)
                      : "border bg-card hover:bg-muted/50"
                  )}
                >
                  <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("size-3.5", color)} />
                  </div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Your Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="h-11"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">A code will be sent to verify your feedback.</p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Write your thoughts here..."
              className="min-h-28 resize-none"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
              minLength={10}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">{form.message.length}/2000</p>
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={submitting || !form.type || form.message.length < 10}
          >
            {submitting ? <Spinner className="mr-2" /> : null}
            {submitting ? "Sending..." : "Continue"}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <img src={wernaLogo} alt="Werna" className="h-4 w-auto opacity-50" />
          <span>Powered by Werna</span>
        </div>
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
