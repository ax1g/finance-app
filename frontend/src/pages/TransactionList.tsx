import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { fetchTransactions, type TransactionFilters } from "../api/transactions"
import type { TransactionRead } from "../types"

const TXN_TYPES = ["", "income", "expense", "adjustment", "transfer"] as const

function fmtAmount(txn: TransactionRead): string {
  const sign = txn.txn_type === "expense" ? "-" : "+"
  return `${sign}$${parseFloat(txn.amount).toFixed(2)}`
}

export default function TransactionList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [transactions, setTransactions] = useState<TransactionRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const txnType = searchParams.get("txn_type") || ""

  useEffect(() => {
    let cancelled = false

    const filters: TransactionFilters = { limit: 50 }
    if (txnType) filters.txn_type = txnType

    fetchTransactions(filters)
      .then((data) => {
        if (!cancelled) setTransactions(data)
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
  }, [txnType])

  const handleFilterChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set("txn_type", value)
    else next.delete("txn_type")
    setSearchParams(next)
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>Transactions</h2>
        <select
          value={txnType}
          onChange={(e) => handleFilterChange(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 14 }}
        >
          {TXN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t ? t.charAt(0).toUpperCase() + t.slice(1) : "All Types"}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#e53e3e" }}>{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <p>No transactions found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {transactions.map((txn) => (
          <Link
            key={txn.id}
            to={`/transactions/${txn.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              textDecoration: "none",
              color: "var(--text-h)",
              transition: "box-shadow 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.boxShadow = "var(--shadow)")}
            onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontWeight: 500 }}>
                {txn.description || txn.category.name}
              </span>
              <span style={{ fontSize: 13, color: "var(--text)" }}>
                {new Date(txn.txn_date).toLocaleDateString()} &middot;{" "}
                {txn.account.name}
              </span>
            </div>
            <span
              style={{
                fontWeight: 600,
                color: txn.txn_type === "expense" ? "#e53e3e" : "#38a169",
              }}
            >
              {fmtAmount(txn)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
