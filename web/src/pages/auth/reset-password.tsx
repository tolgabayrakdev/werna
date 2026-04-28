import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { AuthLeftPanel } from "@/components/auth-left-panel"
import wernaLogo from "@/assets/werna_logo.svg"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-semibold">Invalid Link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Request new link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await apiClient.post("/api/auth/reset-password", { token, newPassword })
      toast.success("Your password has been updated. You can now sign in.")
      navigate("/sign-in", { replace: true })
    } catch (error) {
      const message = error instanceof ApiClientError ? error.data.message : "Password could not be reset"
      toast.error(message || "Password could not be reset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthLeftPanel
        heading={<>Set your new<br />password</>}
        description="Create a strong, memorable password for your account."
      />

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={wernaLogo} alt="Werna" className="h-8 w-auto" />
              <span className="text-2xl font-semibold tracking-tight">Werna</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Password reset</p>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">New Password</h2>
            <p className="text-sm text-muted-foreground">
              Set a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                placeholder="At least 8 characters"
                className="h-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Re-enter your password"
                className="h-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Saving..." : "Update Password"}
            </Button>
          </form>

          <div className="flex items-center justify-center">
            <Link to="/sign-in" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
