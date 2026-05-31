import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createTransaction } from "../api/transactions"
import { fetchAccounts } from "../api/accounts"
import { fetchCategories } from "../api/categories"
import type { AccountRead, CategoryRead, TransactionType } from "../types"

export default function TransactionCreate() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<AccountRead[]>([])
  const [categories, setCategories] = useState<CategoryRead[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    txn_date: new Date().toISOString().slice(0, 16),
    txn_type: "expense" as TransactionType | "",
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
        if (accts.length) setForm((f) => ({ ...f, account_id: accts[0].id }))
        if (cats.length) setForm((f) => ({ ...f, category_id: cats[0].id }))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
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
      const created = await createTransaction({
        txn_date: new Date(form.txn_date).toISOString(),
        txn_type: form.txn_type,
        amount: form.amount,
        description: form.description || null,
        account_id: form.account_id,
        category_id: form.category_id,
      })
      navigate(`/transactions/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Loading form...</p>

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>New Transaction</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
            Type
            <select
              value={form.txn_type}
              onChange={(e) => setForm({ ...form, txn_type: e.target.value as TransactionType })}
              required
              style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
            >
              <option value="">Select...</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>

          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
            Amount
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
            />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
          Date & Time
          <input
            type="datetime-local"
            value={form.txn_date}
            onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
            required
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
          Account
          <select
            value={form.account_id}
            onChange={(e) => setForm({ ...form, account_id: e.target.value })}
            required
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (${parseFloat(a.current_balance).toFixed(2)})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
          Category
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            required
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
          Description
          <input
            type="text"
            placeholder="Optional note"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
          />
        </label>

        {error && <p style={{ color: "#e53e3e", fontSize: 14, margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "none",
              cursor: "pointer",
              fontSize: 15,
              color: "var(--text-h)",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Saving..." : "Create Transaction"}
          </button>
        </div>
      </form>
    </div>
  )
}
