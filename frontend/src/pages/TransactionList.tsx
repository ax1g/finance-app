import { useEffect, useState, useCallback } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { fetchTransactions, type TransactionFilters } from "@/api/transactions"
import { useDataRefresh } from "@/context/DataRefreshContext"
import { useToast } from "@/context/ToastContext"
import type { TransactionSummary } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fmt, formatDate } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, ArrowRight, Loader2 } from "lucide-react"

const TXN_TYPES = [
  { value: "all", label: "All Types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "adjustment", label: "Adjustment" },
  { value: "transfer", label: "Transfer" },
]

function fmtAmount(txn: TransactionSummary): string {
  if (txn.txn_type === "adjustment") return fmt(txn.amount)
  if (txn.txn_type === "transfer") return fmt(txn.amount)
  const sign = txn.txn_type === "expense" ? "-" : "+"
  return `${sign}${fmt(txn.amount)}`
}

export default function TransactionList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const { version } = useDataRefresh()
  const { toast } = useToast()

  const txnType = searchParams.get("txn_type") || ""

  const load = useCallback(async (cursor?: string) => {
    const filters: TransactionFilters = { limit: 50 }
    if (txnType && txnType !== "all") filters.txn_type = txnType
    if (cursor) filters.cursor = cursor

    const page = await fetchTransactions(filters)
    return page
  }, [txnType])

  useEffect(() => {
    let cancelled = false
    setTransactions([])
    setNextCursor(null)
    setHasMore(false)
    setLoading(true)

    load()
      .then((page) => {
        if (cancelled) return
        setTransactions(page.items)
        setNextCursor(page.next_cursor)
        setHasMore(page.has_more)
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [load, version.transactions])

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await load(nextCursor)
      setTransactions((prev) => [...prev, ...page.items])
      setNextCursor(page.next_cursor)
      setHasMore(page.has_more)
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to load more", variant: "destructive" });
    } finally {
      setLoadingMore(false)
    }
  }

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
        {!loading && transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transactions found.
          </p>
        )}
        {!loading && transactions.length > 0 && (
          <div className="space-y-1">
            {transactions.map((txn) => (
              <Link
                key={txn.id}
                to={`/transactions/${txn.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
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
                      <ArrowDownRight className="h-4 w-4" />
                    ) : txn.txn_type === "adjustment" ? (
                      <span className="text-xs font-bold">~</span>
                    ) : txn.txn_type === "transfer" ? (
                      <ArrowLeftRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {txn.description || txn.category_name || "Transfer"}
                    </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(txn.txn_date)} &middot;{" "}
                        {txn.txn_type === "transfer" ? (
                          <>{txn.account_name} <ArrowRight className="inline h-3 w-3" /> {txn.to_account_name || "?"}</>
                        ) : (
                          txn.account_name
                        )}
                      </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`font-number text-xs ${
                      txn.txn_type === "expense"
                        ? "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                        : txn.txn_type === "adjustment"
                          ? "bg-muted text-muted-foreground"
                          : txn.txn_type === "transfer"
                            ? "bg-primary/10 text-primary"
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
        {hasMore && !loading && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
