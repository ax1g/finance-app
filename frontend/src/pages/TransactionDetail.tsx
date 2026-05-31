import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchTransaction, deleteTransaction, updateTransaction } from "../api/transactions"
import { fetchAccounts } from "../api/accounts"
import { fetchCategories } from "../api/categories"
import type { AccountRead, CategoryRead, TransactionRead, TransactionType } from "../types"

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
    txn_type: "" as TransactionType | "",
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
    if (!txn_id || !editForm.txn_type || !editForm.account_id || !editForm.category_id) return
    setSaving(true)
    setError("")
    try {
      const updated = await updateTransaction(txn_id, {
        txn_date: new Date(editForm.txn_date).toISOString(),
        txn_type: editForm.txn_type,
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

  if (loading) return <p>Loading...</p>
  if (error && !txn) return <p style={{ color: "#e53e3e" }}>{error}</p>
  if (!txn) return <p>Transaction not found.</p>

  if (editing) {
    return (
      <div style={{ maxWidth: 480 }}>
        <h2>Edit Transaction</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
              Type
              <select
                value={editForm.txn_type}
                onChange={(e) => setEditForm({ ...editForm, txn_type: e.target.value as TransactionType })}
                style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
              >
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
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
              />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
            Date & Time
            <input
              type="datetime-local"
              value={editForm.txn_date}
              onChange={(e) => setEditForm({ ...editForm, txn_date: e.target.value })}
              style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
            Account
            <select
              value={editForm.account_id}
              onChange={(e) => setEditForm({ ...editForm, account_id: e.target.value })}
              style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
            Category
            <select
              value={editForm.category_id}
              onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
              style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text)" }}>
            Description
            <input
              type="text"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 15 }}
            />
          </label>

          {error && <p style={{ color: "#e53e3e", fontSize: 14, margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid var(--border)", background: "none", cursor: "pointer", fontSize: 15, color: "var(--text-h)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", fontSize: 15, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>Transaction Details</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setEditing(true)}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", background: "none", cursor: "pointer", fontSize: 14, color: "var(--text-h)" }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e53e3e", background: "none", cursor: "pointer", fontSize: 14, color: "#e53e3e", opacity: deleting ? 0.7 : 1 }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 20,
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text)", textTransform: "uppercase", letterSpacing: 1 }}>
            {txn.txn_type}
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: txn.txn_type === "expense" ? "#e53e3e" : "#38a169",
            }}
          >
            {fmtAmount(txn)}
          </span>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 2 }}>Date</div>
            <div style={{ fontSize: 15, color: "var(--text-h)" }}>
              {new Date(txn.txn_date).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 2 }}>Account</div>
            <div style={{ fontSize: 15, color: "var(--text-h)" }}>{txn.account.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 2 }}>Category</div>
            <div style={{ fontSize: 15, color: "var(--text-h)" }}>{txn.category.name}</div>
          </div>
          {txn.description && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 2 }}>Description</div>
              <div style={{ fontSize: 15, color: "var(--text-h)" }}>{txn.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
