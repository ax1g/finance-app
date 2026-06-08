import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { useToast } from "@/context/ToastContext"
import { fetchCurrentUser, changePassword, updateUser } from "@/api/auth"
import type { UserRead } from "@/types"
import { fmt } from "@/lib/utils"
import { getPasswordError } from "@/lib/password"
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
import InstallPWA from "@/components/InstallPWA"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Lock,
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
  Eye,
  EyeOff,
  Globe,
} from "lucide-react"

const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "PHP", label: "Philippine Peso", symbol: "₱" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
  { code: "KRW", label: "South Korean Won", symbol: "₩" },
  { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
  { code: "NPR", label: "Nepali Rupee", symbol: "Rs." },
]

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

export default function Settings() {
  const { logout } = useAuth()
  const { mode, colors, setMode, setColors } = useTheme()
  const { toast } = useToast()
  const [user, setUser] = useState<UserRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [customSymbol, setCustomSymbol] = useState("")
  const [currencySaving, setCurrencySaving] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => {
        setUser(u)
        setSelectedCurrency(u.currency)
        setCustomSymbol(u.currency_custom_symbol ?? "")
      })
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
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (pwForm.newPassword !== pwForm.confirmPassword) {
                toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
                return
              }
              const pwErr = getPasswordError(pwForm.newPassword)
              if (pwErr) {
                toast({ title: "Error", description: pwErr, variant: "destructive" })
                return
              }
              setPwSubmitting(true)
              try {
                await changePassword({
                  current_password: pwForm.currentPassword,
                  new_password: pwForm.newPassword,
                })
                toast({ title: "Password updated", variant: "success" })
                setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Something went wrong"
                toast({ title: "Error", description: msg, variant: "destructive" })
              } finally {
                setPwSubmitting(false)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPw.current ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPw.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPw.new ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, new: !showPw.new })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPw.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPw.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={pwSubmitting}>
              {pwSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
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
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Currency</p>
                <p className="text-xs text-muted-foreground">
                  Set your preferred currency
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} — {c.label} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                  disabled={currencySaving}
                  onClick={async () => {
                    setCurrencySaving(true)
                    try {
                      const payload: { currency: string; currency_custom_symbol?: string | null } = { currency: selectedCurrency }
                      const trimmedSymbol = customSymbol.trim()
                      if (trimmedSymbol) {
                        payload.currency_custom_symbol = trimmedSymbol
                      } else {
                        payload.currency_custom_symbol = null
                      }
                      const updated = await updateUser(payload)
                      setUser(updated)
                      localStorage.setItem("currency", updated.currency)
                      if (updated.currency_custom_symbol) {
                        localStorage.setItem("currency_custom_symbol", updated.currency_custom_symbol)
                      } else {
                        localStorage.removeItem("currency_custom_symbol")
                      }
                      toast({ title: "Currency updated", variant: "success" })
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : "Failed to save"
                      toast({ title: "Error", description: msg, variant: "destructive" })
                    } finally {
                      setCurrencySaving(false)
                    }
                  }}
              >
                {currencySaving ? "Saving..." : "Save"}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input
                placeholder="Custom symbol (optional)"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                className="h-8 text-sm font-mono flex-1"
                maxLength={10}
              />
              {customSymbol && (
                <span className="text-xs text-muted-foreground shrink-0">
                  Preview: {fmt(1234.56, selectedCurrency)}
                </span>
              )}
            </div>

          </div>
        </CardContent>
      </Card>

      <Separator />

      <InstallPWA />

      <div className="flex justify-end">
        <Button variant="destructive" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
