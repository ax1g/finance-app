import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { fetchCurrentUser } from "@/api/auth"
import type { UserRead } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Settings2,
  LogOut,
  Bell,
  Palette,
  Loader2,
  Moon,
  Sun,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

export default function Settings() {
  const { logout } = useAuth()
  const { mode, colors, setMode, setColors } = useTheme()
  const [user, setUser] = useState<UserRead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="text-sm font-medium">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : user?.username ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : user?.email ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize your theme and colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Theme selector */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      mode === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Income / Expense colors */}
          <div className="space-y-3">
            <Label>Transaction Colors</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4" style={{ color: colors.income }} />
                  Income
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.income}
                    onChange={(e) => setColors({ income: e.target.value })}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={colors.income}
                    onChange={(e) => setColors({ income: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowDownRight className="h-4 w-4" style={{ color: colors.expense }} />
                  Expense
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.expense}
                    onChange={(e) => setColors({ expense: e.target.value })}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={colors.expense}
                    onChange={(e) => setColors({ expense: e.target.value })}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setColors({ income: "#16a34a", expense: "#dc2626" })
              }}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Reset to default colors
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Manage notification preferences
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Soon</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Currency & Locale</p>
                <p className="text-xs text-muted-foreground">
                  Set your preferred currency and date format
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Soon</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button variant="destructive" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
