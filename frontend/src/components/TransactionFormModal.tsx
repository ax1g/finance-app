import { useState, useEffect } from "react"
import { createTransaction } from "@/api/transactions"
import { fetchAccounts } from "@/api/accounts"
import { fetchCategories } from "@/api/categories"
import { useModal } from "@/context/ModalContext"
import type { AccountRead, CategoryRead, TransactionType } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import QuickAccountModal from "./QuickAccountModal"
import QuickCategoryModal from "./QuickCategoryModal"

const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  income: ["income"],
  expense: ["expense"],
  adjustment: ["income", "expense"],
  transfer: ["income", "expense"],
}

export default function TransactionFormModal() {
  const { closeTopModal, openModal } = useModal()
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

  const filteredCategories = form.txn_type
    ? categories.filter((c) => CATEGORY_TYPE_MAP[form.txn_type]?.includes(c.type))
    : categories

  const loadData = () => {
    setLoading(true)
    Promise.all([fetchAccounts(), fetchCategories()])
      .then(([accts, cats]) => {
        setAccounts(accts)
        setCategories(cats)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.txn_type || !form.account_id || !form.category_id || !form.amount) {
      setError("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    setError("")

    try {
      await createTransaction({
        txn_date: new Date(form.txn_date).toISOString(),
        txn_type: form.txn_type as TransactionType,
        amount: form.amount,
        description: form.description || null,
        account_id: form.account_id,
        category_id: form.category_id,
      })
      closeTopModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    } finally {
      setSubmitting(false)
    }
  }

  const openQuickAccount = () => {
    openModal(
      "quick-account",
      <QuickAccountModal
        onCreated={(account) => {
          setAccounts((prev) => [...prev, account])
          setForm((prev) => ({ ...prev, account_id: account.id }))
        }}
      />,
    )
  }

  const openQuickCategory = () => {
    openModal(
      "quick-category",
      <QuickCategoryModal
        onCreated={(category) => {
          setCategories((prev) => [...prev, category])
          setForm((prev) => ({ ...prev, category_id: category.id }))
        }}
      />,
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-1">New Transaction</h2>
      <p className="text-sm text-muted-foreground mb-6">Record a new income or expense</p>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(["income", "expense", "transfer"] as const).map((type) => {
                const selected = form.txn_type === type
                const isIncome = type === "income"
                const isExpense = type === "expense"
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const allowed = CATEGORY_TYPE_MAP[type] || []
                      const currentCat = categories.find((c) => c.id === form.category_id)
                      const category_id =
                        currentCat && allowed.includes(currentCat.type)
                          ? form.category_id
                          : ""
                      setForm({ ...form, txn_type: type, category_id })
                    }}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all",
                      selected
                        ? isIncome
                          ? "bg-[var(--color-income)] text-white"
                          : isExpense
                            ? "bg-[var(--color-expense)] text-white"
                            : "bg-primary text-primary-foreground"
                        : "border border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-amount">Amount</Label>
            <Input
              id="modal-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className={cn(
                "font-number text-lg",
                form.txn_type === "income" && "text-[var(--color-income)]",
                form.txn_type === "expense" && "text-[var(--color-expense)]"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-date">Date & Time</Label>
            <Input
              id="modal-date"
              type="datetime-local"
              value={form.txn_date}
              onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-account">Account</Label>
              <button
                type="button"
                onClick={openQuickAccount}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                New Account
              </button>
            </div>
            <Select
              value={form.account_id}
              onValueChange={(value) => setForm({ ...form, account_id: value })}
            >
              <SelectTrigger id="modal-account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent position="popper" style={{ maxHeight: '15rem' }}>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-category">Category</Label>
              <button
                type="button"
                onClick={openQuickCategory}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                New Category
              </button>
            </div>
            <Select
              value={form.category_id}
              onValueChange={(value) => setForm({ ...form, category_id: value })}
            >
              <SelectTrigger id="modal-category">
                <SelectValue placeholder="Select category" />
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

          <div className="space-y-2">
            <Label htmlFor="modal-description">Description</Label>
            <Input
              id="modal-description"
              placeholder="Optional note"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={closeTopModal}>
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
      )}
    </div>
  )
}
