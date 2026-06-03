import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { fetchTransactions, type TransactionFilters } from "@/api/transactions"
import type { TransactionRead } from "@/types"
import { Badge } from "@/components/ui/badge"
import { fmt, formatDate } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"

const TXN_TYPES = [
  { value: "all", label: "All Types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "adjustment", label: "Adjustment" },
  { value: "transfer", label: "Transfer" },
]

function fmtAmount(txn: TransactionRead): string {
  const sign = txn.txn_type === "expense" ? "-" : "+"
  return `${sign}$${fmt(txn.amount)}`
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
    if (txnType && txnType !== "all") filters.txn_type = txnType

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Transaction History</CardTitle>
        <div className="flex items-center gap-3">
          <Select
            value={txnType}
            onValueChange={(value) => {
              const next = new URLSearchParams(searchParams)
              if (value && value !== "all") next.set("txn_type", value)
              else next.delete("txn_type")
              setSearchParams(next)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {TXN_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </div>
        )}
        {error && (
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions found.
          </p>
        )}
        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-1">
            {transactions.map((txn) => (
              <Link
                key={txn.id}
                to={`/transactions/${txn.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      txn.txn_type === "expense"
                        ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                        : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
                    }`}
                  >
                    {txn.txn_type === "expense" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {txn.description || txn.category.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(txn.txn_date)} &middot;{" "}
                      {txn.account.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`font-number text-xs ${
                      txn.txn_type === "expense"
                        ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                        : "bg-[var(--color-income)]/10 text-[var(--color-income)]"
                    }`}
                  >
                    {fmtAmount(txn)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
