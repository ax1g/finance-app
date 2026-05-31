import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  fetchTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/api/transactions"
import { fetchAccounts } from "@/api/accounts"
import { fetchCategories } from "@/api/categories"
import type {
  AccountRead,
  CategoryRead,
  TransactionRead,
  TransactionType,
} from "@/types"
import { Button } from "@/components/ui/button"
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
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react"

function fmtAmount(txn: TransactionRead): string {
  const sign = txn.txn_type === "expense" ? "-" : "+"
  return `${sign}$${parseFloat(txn.amount).toFixed(2)}`
}

export default function TransactionDetail() {
  const { txn_id } = useParams<{ txn_id: string }>()
  const navigate = useNavigate()

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
  })

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
          txn_date: new Date(txnData.txn_date).toISOString().slice(0, 16),
          txn_type: txnData.txn_type,
          amount: txnData.amount,
          description: txnData.description || "",
          account_id: txnData.account_id,
          category_id: txnData.category_id,
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
      navigate("/transactions", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (
      !txn_id ||
      !editForm.txn_type ||
      !editForm.account_id ||
      !editForm.category_id
    )
      return
    setSaving(true)
    setError("")
    try {
      const updated = await updateTransaction(txn_id, {
        txn_date: new Date(editForm.txn_date).toISOString(),
        txn_type: editForm.txn_type as TransactionType,
        amount: editForm.amount,
        description: editForm.description || null,
        account_id: editForm.account_id,
        category_id: editForm.category_id,
      })
      setTxn(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
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
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, txn_type: value })
                    }
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                <Label htmlFor="edit-account">Account</Label>
                <Select
                  value={editForm.account_id}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, account_id: value })
                  }
                >
                  <SelectTrigger id="edit-account">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="capitalize">{txn.txn_type}</CardTitle>
              <CardDescription>
                {new Date(txn.txn_date).toLocaleString()}
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
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {txn.txn_type === "expense" ? (
                <ArrowDownRight className="h-6 w-6" />
              ) : (
                <ArrowUpRight className="h-6 w-6" />
              )}
            </div>
            <Badge
              variant={txn.txn_type === "expense" ? "destructive" : "secondary"}
              className="font-mono text-base"
            >
              {fmtAmount(txn)}
            </Badge>
          </div>

          <Separator className="mb-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account</p>
              <p className="font-medium">{txn.account.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{txn.category.name}</p>
            </div>
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
