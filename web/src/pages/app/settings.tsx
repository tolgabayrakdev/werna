import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import type { Business } from "@/store/auth-store"
import { apiClient, ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { Pencil, TriangleAlertIcon, MapPin, Globe, Phone } from "lucide-react"

interface BusinessProfileData {
  sector: string
  description: string
  phone: string
  website: string
  address: string
  city: string
  country: string
}

const INITIAL_PROFILE: BusinessProfileData = {
  sector: "",
  description: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  country: "",
}

export default function Settings() {
  const { user, logout } = useAuthStore()

  // --- Profile ---
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // --- Business Profile ---
  const [bizProfile, setBizProfile] = useState<BusinessProfileData>(INITIAL_PROFILE)
  const [bizProfileEditing, setBizProfileEditing] = useState(false)
  const [bizProfileForm, setBizProfileForm] = useState<BusinessProfileData>(INITIAL_PROFILE)
  const [bizProfileLoading, setBizProfileLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: { profile: BusinessProfileData | null } }>(
          "/api/account/me/profile"
        )
        if (res.data.profile) {
          const p = res.data.profile
          const data = {
            sector: p.sector ?? "",
            description: p.description ?? "",
            phone: p.phone ?? "",
            website: p.website ?? "",
            address: p.address ?? "",
            city: p.city ?? "",
            country: p.country ?? "",
          }
          setBizProfile(data)
          setBizProfileForm(data)
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const handleProfileEdit = () => {
    setProfileForm({ name: user?.name ?? "", email: user?.email ?? "" })
    setProfileEditing(true)
  }

  const handleProfileCancel = () => {
    setProfileEditing(false)
    setProfileForm({ name: user?.name ?? "", email: user?.email ?? "" })
  }

  const handleProfileSave = async () => {
    setProfileLoading(true)
    try {
      const res = await apiClient.patch<{ success: boolean; data: Business }>("/api/account/me", profileForm)
      useAuthStore.setState({ user: res.data })
      setProfileEditing(false)
      toast.success("Profile information updated.")
    } catch (err) {
      toast.error(err instanceof ApiClientError ? (err.data.message ?? "Could not update profile.") : "An error occurred.")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleBizProfileEdit = () => {
    setBizProfileForm({ ...bizProfile })
    setBizProfileEditing(true)
  }

  const handleBizProfileCancel = () => {
    setBizProfileForm({ ...bizProfile })
    setBizProfileEditing(false)
  }

  const handleBizProfileSave = async () => {
    setBizProfileLoading(true)
    try {
      await apiClient.post("/api/account/me/profile", {
        sector: bizProfileForm.sector || undefined,
        description: bizProfileForm.description || undefined,
        phone: bizProfileForm.phone || undefined,
        website: bizProfileForm.website || undefined,
        address: bizProfileForm.address || undefined,
        city: bizProfileForm.city || undefined,
        country: bizProfileForm.country || undefined,
      })
      setBizProfile({ ...bizProfileForm })
      setBizProfileEditing(false)
      toast.success("Business profile updated.")
    } catch (err) {
      toast.error(err instanceof ApiClientError ? (err.data.message ?? "Could not update business profile.") : "An error occurred.")
    } finally {
      setBizProfileLoading(false)
    }
  }

  // --- Password ---
  const [passwordEditing, setPasswordEditing] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const handlePasswordCancel = () => {
    setPasswordEditing(false)
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setPasswordError("")
  }

  const handlePasswordSave = async () => {
    setPasswordError("")
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    setPasswordLoading(true)
    try {
      await apiClient.patch("/api/account/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success("Your password has been updated.")
      handlePasswordCancel()
    } catch (err) {
      toast.error(err instanceof ApiClientError ? (err.data.message ?? "Could not update password.") : "An error occurred.")
    } finally {
      setPasswordLoading(false)
    }
  }

  // --- Delete ---
  const [deleteStep, setDeleteStep] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await apiClient.delete("/api/account/me")
      toast.success("Your account has been deleted.")
      await logout()
    } catch (err) {
      toast.error(err instanceof ApiClientError ? (err.data.message ?? "Could not delete account.") : "An error occurred.")
      setDeleteLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your business information and security settings.</p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account Information</CardTitle>
            <CardDescription>Your business name and email address identify your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={profileEditing ? profileForm.name : (user?.name ?? "")}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  readOnly={!profileEditing}
                  className={!profileEditing ? "bg-muted/40 cursor-default" : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileEditing ? profileForm.email : (user?.email ?? "")}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  readOnly={!profileEditing}
                  className={!profileEditing ? "bg-muted/40 cursor-default" : ""}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              {profileEditing ? (
                <>
                  <Button variant="outline" onClick={handleProfileCancel} disabled={profileLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleProfileSave} disabled={profileLoading} className="min-w-24">
                    {profileLoading && <Spinner className="mr-2" />}
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleProfileEdit} className="gap-1.5">
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Business Profile</CardTitle>
            <CardDescription>Detailed information and contact details of your business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!bizProfileEditing ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Sector</Label>
                    <p className="text-sm font-medium">{bizProfile.sector || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Phone</Label>
                    <p className="text-sm font-medium">{bizProfile.phone || "—"}</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className="text-sm font-medium">{bizProfile.description || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Website</Label>
                    <p className="text-sm font-medium">{bizProfile.website || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Country</Label>
                    <p className="text-sm font-medium">{bizProfile.country || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">City</Label>
                    <p className="text-sm font-medium">{bizProfile.city || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Address</Label>
                    <p className="text-sm font-medium">{bizProfile.address || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={handleBizProfileEdit} className="gap-1.5">
                    <Pencil className="size-3.5" />
                  Edit
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleBizProfileSave() }} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-sector">Sector</Label>
                    <Input
                      id="biz-sector"
                      value={bizProfileForm.sector}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, sector: e.target.value }))}
                      placeholder="e.g. Restaurant, Retail, Technology"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-phone">
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        Phone
                      </span>
                    </Label>
                    <Input
                      id="biz-phone"
                      type="tel"
                      value={bizProfileForm.phone}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 xxx xxx xxxx"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="biz-description">Description</Label>
                    <Textarea
                      id="biz-description"
                      value={bizProfileForm.description}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Briefly introduce your business"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-website">
                      <span className="flex items-center gap-1.5">
                        <Globe className="size-3.5" />
                        Website
                      </span>
                    </Label>
                    <Input
                      id="biz-website"
                      type="url"
                      value={bizProfileForm.website}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-country">Country</Label>
                    <Input
                      id="biz-country"
                      value={bizProfileForm.country}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, country: e.target.value }))}
                      placeholder="United States"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-city">City</Label>
                    <Input
                      id="biz-city"
                      value={bizProfileForm.city}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-address">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        Address
                      </span>
                    </Label>
                    <Input
                      id="biz-address"
                      value={bizProfileForm.address}
                      onChange={(e) => setBizProfileForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Street, Avenue, No"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={handleBizProfileCancel} disabled={bizProfileLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={bizProfileLoading} className="min-w-24">
                    {bizProfileLoading && <Spinner className="mr-2" />}
                    Save
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Password</CardTitle>
            <CardDescription>Update your password regularly to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            {!passwordEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input value="••••••••••" readOnly className="bg-muted/40 cursor-default tracking-widest max-w-sm" />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setPasswordEditing(true)} className="gap-1.5">
                    <Pencil className="size-3.5" />
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <PasswordInput
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New Password</Label>
                    <PasswordInput
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => { setPasswordError(""); setPasswordForm((p) => ({ ...p, newPassword: e.target.value })) }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => { setPasswordError(""); setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value })) }}
                    />
                  </div>
                </div>
                {passwordError && <p className="text-destructive text-xs">{passwordError}</p>}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={handlePasswordCancel} disabled={passwordLoading}>Cancel</Button>
                  <Button
                    onClick={handlePasswordSave}
                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="min-w-24"
                  >
                    {passwordLoading && <Spinner className="mr-2" />}
                    Save
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete your account. All links and feedback will also be deleted.</CardDescription>
          </CardHeader>
          <CardContent>
            {!deleteStep ? (
              <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All your data will be permanently deleted, this action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setDeleteStep(true)} className="shrink-0">
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <TriangleAlertIcon className="size-4 shrink-0" />
                  <p className="text-sm font-medium">This action cannot be undone.</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  To confirm, type your business name:{" "}
                  <span className="font-semibold text-foreground">{user?.name}</span>
                </p>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={user?.name}
                  className="max-w-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setDeleteStep(false); setDeleteConfirm("") }} disabled={deleteLoading}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== user?.name || deleteLoading}
                    className="min-w-28"
                  >
                    {deleteLoading && <Spinner className="mr-2" />}
                    Yes, Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
