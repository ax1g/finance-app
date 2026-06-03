import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  fetchAccount,
  updateAccount,
  deleteAccount,
} from "@/api/accounts"
import { useToast } from "@/context/ToastContext"
import type { AccountRead, AccountType } from "@/types"
import { Button } from "@/components/ui/button"
import { fmt } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Landmark,
  Building2,
  PiggyBank,
  Handshake,
  Banknote,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react"

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-6 w-6" />,
  bank: <Landmark className="h-6 w-6" />,
  investment: <PiggyBank className="h-6 w-6" />,
  receivables: <Handshake className="h-6 w-6" />,
  payables: <Building2 className="h-6 w-6" />,
}

const ACCOUNT_COLORS: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  bank: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  investment: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  receivables: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  payables: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
}

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "investment", label: "Investment" },
  { value: "receivables", label: "Receivables" },
  { value: "payables", label: "Payables" },
]

export default function AccountDetail() {
  const { account_id } = useParams<{ account_id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [account, setAccount] = useState<AccountRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    type: "" as AccountType | "",
  })

  useEffect(() => {
    if (!account_id) return
    let cancelled = false

    fetchAccount(account_id)
      .then((data) => {
        if (cancelled) return
        setAccount(data)
        setEditForm({ name: data.name, type: data.type })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [account_id])

  const handleDelete = async () => {
    if (!account_id || !window.confirm("Delete this account?")) return
    setDeleting(true)
    try {
      await deleteAccount(account_id)
      toast({ title: "Account deleted", variant: "success" })
      navigate("/accounts", { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!account_id || !editForm.name || !editForm.type) return
    setSaving(true)
    setError("")
    try {
      const updated = await updateAccount(account_id, {
        name: editForm.name,
        type: editForm.type as AccountType,
      })
      setAccount(updated)
      setEditing(false)
      toast({ title: "Account updated", variant: "success" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed"
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    )
  }
  if (error && !account)
    return (
      <p className="py-8 text-center text-sm text-destructive">{error}</p>
    )
  if (!account)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Account not found.
      </p>
    )

  if (editing) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Edit Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) =>
                    setEditForm({
                      ...editForm,
                      type: value as AccountType,
                    })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{account.name}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-4 w-4" />
                )}
                {deleting ? "" : "Delete"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${ACCOUNT_COLORS[account.type] || ACCOUNT_COLORS.bank}`}
            >
              {ACCOUNT_ICONS[account.type] || ACCOUNT_ICONS.bank}
            </div>
            <div>
              <Badge variant="secondary" className="mb-1 capitalize">
                {account.type}
              </Badge>
              <p className="text-2xl font-semibold font-number">
                {fmt(account.current_balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
