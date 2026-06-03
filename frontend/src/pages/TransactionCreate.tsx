import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createTransaction } from "@/api/transactions"
import { fetchAccounts } from "@/api/accounts"
import { fetchCategories } from "@/api/categories"
import { useToast } from "@/context/ToastContext"
import type { AccountRead, CategoryRead, TransactionType } from "@/types"
import { Button } from "@/components/ui/button"
import { fmt } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Loader2 } from "lucide-react"

export default function TransactionCreate() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<AccountRead[]>([])
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    txn_date: new Date().toISOString().slice(0, 16),
    txn_type: "",
    amount: "",
    description: "",
    account_id: "",
    category_id: "",
  })

  useEffect(() => {
    Promise.all([fetchAccounts(), fetchCategories()])
      .then(([accts, cats]) => {
        setAccounts(accts)
        setCategories(cats)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !form.txn_type ||
      !form.account_id ||
      !form.category_id ||
      !form.amount
    ) {
      setError("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    setError("")

    try {
      const created = await createTransaction({
        txn_date: new Date(form.txn_date).toISOString(),
        txn_type: form.txn_type as TransactionType,
        amount: form.amount,
        description: form.description || null,
        account_id: form.account_id,
        category_id: form.category_id,
      })
      toast({ title: "Transaction created", variant: "success" })
      navigate(`/transactions/${created.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create transaction"
      setError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSubmitting(false)
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

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>Record a new income or expense</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.txn_type}
                  onValueChange={(value) =>
                    setForm({ ...form, txn_type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={form.txn_date}
                onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select
                value={form.account_id}
                onValueChange={(value) =>
                  setForm({ ...form, account_id: value })
                }
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({fmt(a.current_balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(value) =>
                  setForm({ ...form, category_id: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional note"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/transactions")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Transaction"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
