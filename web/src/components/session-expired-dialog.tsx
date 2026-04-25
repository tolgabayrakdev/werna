import { useState } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SessionExpiredDialog() {
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const extendSession = useAuthStore((state) => state.extendSession)
  const logout = useAuthStore((state) => state.logout)
  const [loading, setLoading] = useState<"extend" | "logout" | null>(null)

  const handleExtend = async () => {
    setLoading("extend")
    await extendSession()
    setLoading(null)
  }

  const handleLogout = async () => {
    setLoading("logout")
    await logout()
    setLoading(null)
  }

  return (
    <DialogPrimitive.Root open={sessionExpired}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <DialogPrimitive.Title className="text-base font-semibold">
                Oturum Süreniz Doldu
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                Güvenliğiniz için oturumunuz sona erdi. Devam etmek ister misiniz?
              </DialogPrimitive.Description>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleExtend}
                disabled={loading !== null}
              >
                {loading === "extend" ? "Devam ediliyor..." : "Devam Et"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
                disabled={loading !== null}
              >
                {loading === "logout" ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
