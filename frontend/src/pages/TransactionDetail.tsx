import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  fetchTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/api/transactions"
import { fetchAccounts } from "@/api/accounts"
import { fetchCategories } from "@/api/categories"
import { useToast } from "@/context/ToastContext"
import { useDataRefresh } from "@/context/DataRefreshContext"
import type {
  AccountRead,
  CategoryRead,
  TransactionRead,
  TransactionType,
} from "@/types"
import { Button } from "@/components/ui/button"
import { fmt, formatDate, toLocalDatetime } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react"

const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  income: ["income"],
  expense: ["expense"],
}

function fmtAmount(txn: TransactionRead): string {
  if (txn.txn_type === "adjustment") return fmt(txn.amount)
  if (txn.txn_type === "transfer") return fmt(txn.amount)
  const sign = txn.txn_type === "expense" ? "-" : "+"
  return `${sign}${fmt(txn.amount)}`
}

export default function TransactionDetail() {
  const { txn_id } = useParams<{ txn_id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signal } = useDataRefresh()

  const [txn, setTxn] = useState<TransactionRead | null>(null)
  const [accounts, setAccounts] = useState<AccountRead[]>([])
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    txn_date: "",
    txn_type: "",
    amount: "",
    description: "",
    account_id: "",
    category_id: "",
    to_account_id: "",
  })

  const isTransferEdit = editForm.txn_type === "transfer"
  const showCategoryEdit = editForm.txn_type && !isTransferEdit && editForm.txn_type !== "adjustment"

  const filteredCategories = (showCategoryEdit
    ? categories.filter((c) => CATEGORY_TYPE_MAP[editForm.txn_type]?.includes(c.type))
    : categories
  ).filter((c) => c.name !== "Opening Balance")

  useEffect(() => {
    if (!txn_id) return
    let cancelled = false

    Promise.all([
      fetchTransaction(txn_id),
      fetchAccounts(),
      fetchCategories(),
    ])
      .then(([txnData, accts, cats]) => {
        if (cancelled) return
        setTxn(txnData)
        setAccounts(accts)
        setCategories(cats)
        setEditForm({
          txn_date: toLocalDatetime(new Date(txnData.txn_date)).replace(" ", "T"),
          txn_type: txnData.txn_type,
          amount: txnData.amount,
          description: txnData.description || "",
          account_id: txnData.account_id,
          category_id: txnData.category_id || "",
          to_account_id: txnData.to_account_id || "",
        })
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
  }, [txn_id])

  const handleDelete = async () => {
    if (!txn_id || !window.confirm("Delete this transaction?")) return
    setDeleting(true)
    try {
      await deleteTransaction(txn_id)
      signal("transactions")
      toast({ title: "Transaction deleted", variant: "success" })
      navigate("/transactions", { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (
      !txn_id ||
      !editForm.txn_type ||
      !editForm.account_id
    )
      return
    if (isTransferEdit && !editForm.to_account_id) {
      toast({ title: "Error", description: "Please select a destination account", variant: "destructive" })
      return
    }
    if (!isTransferEdit && !editForm.category_id) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" })
      return
    }
    setSaving(true)
    setError("")
    try {
      const updated = await updateTransaction(txn_id, {
        txn_date: new Date(editForm.txn_date).toISOString(),
        txn_type: editForm.txn_type as TransactionType,
        amount: editForm.amount,
        description: editForm.description || null,
        account_id: editForm.account_id,
      category_id: isTransferEdit || editForm.txn_type === "adjustment" ? null : editForm.category_id || null,
      to_account_id: isTransferEdit ? editForm.to_account_id : null,
      })
      setTxn(updated)
      setEditing(false)
      signal("transactions")
      toast({ title: "Transaction updated", variant: "success" })
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
  if (error && !txn)
    return (
      <p className="py-8 text-center text-sm text-destructive">{error}</p>
    )
  if (!txn)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Transaction not found.
      </p>
    )

  if (editing) {
    return (
      <div className="mx-auto max-w-lg">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => navigate("/transactions")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Edit Transaction</CardTitle>
            <CardDescription>Update transaction details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editForm.txn_type}
                    onValueChange={(value) => {
                      const allowed = CATEGORY_TYPE_MAP[value] || []
                      const currentCat = categories.find((c) => c.id === editForm.category_id)
                      const category_id =
                        currentCat && allowed.includes(currentCat.type)
                          ? editForm.category_id
                          : ""
                      setEditForm({
                        ...editForm,
                        txn_type: value,
                        category_id,
                        to_account_id: value === "transfer" ? editForm.to_account_id : "",
                      })
                    }}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" style={{ maxHeight: '15rem' }}>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date & Time</Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={editForm.txn_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, txn_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-account">
                  {isTransferEdit ? "From Account" : "Account"}
                </Label>
                <Select
                  value={editForm.account_id}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, account_id: value })
                  }
                >
                  <SelectTrigger id="edit-account">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" style={{ maxHeight: '15rem' }}>
                    {accounts
                      .filter((a) => !isTransferEdit || a.id !== editForm.to_account_id)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {isTransferEdit && (
                <div className="space-y-2">
                  <Label htmlFor="edit-to-account">To Account</Label>
                  <Select
                    value={editForm.to_account_id}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, to_account_id: value })
                    }
                  >
                    <SelectTrigger id="edit-to-account">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" style={{ maxHeight: '15rem' }}>
                      {accounts
                        .filter((a) => a.id !== editForm.account_id)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {showCategoryEdit && (
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editForm.category_id}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, category_id: value })
                    }
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="min-w-[220px]" style={{ maxHeight: '15rem' }}>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon ? `${c.icon} ${c.name}` : c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
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
      <Button
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => navigate("/transactions")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="capitalize">{txn.txn_type}</CardTitle>
              <CardDescription>
                {formatDate(txn.txn_date)}
              </CardDescription>
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
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                txn.txn_type === "expense"
                  ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                  : txn.txn_type === "adjustment"
                    ? "bg-muted text-muted-foreground"
                    : txn.txn_type === "transfer"
                      ? "bg-primary/10 text-primary"
                      : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
              }`}
            >
              {txn.txn_type === "expense" ? (
                <ArrowDownRight className="h-6 w-6" />
              ) : txn.txn_type === "adjustment" ? (
                <span className="text-lg font-bold">~</span>
              ) : txn.txn_type === "transfer" ? (
                <ArrowLeftRight className="h-6 w-6" />
              ) : (
                <ArrowUpRight className="h-6 w-6" />
              )}
            </div>
            <Badge
              variant={txn.txn_type === "adjustment" ? "outline" : txn.txn_type === "expense" ? "destructive" : txn.txn_type === "transfer" ? "default" : "secondary"}
              className="font-number text-base"
            >
              {fmtAmount(txn)}
            </Badge>
          </div>

          <Separator className="mb-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {txn.txn_type === "transfer" ? (
              <>
                <div>
                  <p className="text-muted-foreground">From Account</p>
                  <p className="font-medium">{txn.account.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">To Account</p>
                  <p className="font-medium">{txn.to_account?.name || "—"}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-muted-foreground">Account</p>
                  <p className="font-medium">{txn.account.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{txn.category?.name || "—"}</p>
                </div>
              </>
            )}
            {txn.description && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p className="font-medium">{txn.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
