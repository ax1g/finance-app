import { useEffect, useState } from "react"
import { fetchDashboard } from "@/api/reports"
import type { DashboardResponse } from "@/types"
import { useDataRefresh } from "@/context/DataRefreshContext"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, TrendingDown, Wallet, PieChart, ArrowRight } from "lucide-react"
import { fmt, formatDate } from "@/lib/utils"
import { Link } from "react-router-dom"

function DonutChart({
  income,
  expense,
}: {
  income: number
  expense: number
}) {
  const total = income + expense
  if (total === 0)
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    )

  const incomePct = (income / total) * 100
  const expensePct = (expense / total) * 100

  const r = 60
  const circ = 2 * Math.PI * r
  const incomeLen = circ * (incomePct / 100)
  const expenseLen = circ * (expensePct / 100)

  return (
    <div className="flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          className="stroke-border"
          strokeWidth="24"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          className="stroke-green-500"
          strokeWidth="24"
          strokeDasharray={`${incomeLen} ${circ - incomeLen}`}
          strokeDashoffset={0}
          transform="rotate(-90 80 80)"
          strokeLinecap="butt"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          className="stroke-red-500"
          strokeWidth="24"
          strokeDasharray={`${expenseLen} ${circ - expenseLen}`}
          strokeDashoffset={-incomeLen}
          transform="rotate(-90 80 80)"
          strokeLinecap="butt"
        />
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState("")
  const { version } = useDataRefresh()

  useEffect(() => {
    let cancelled = false

    fetchDashboard()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [version.transactions, version.accounts])

  const loading = data === null && !error

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">{error}</p>
    )
  }

  const incomeNum = data ? parseFloat(data.current_month_income) : 0
  const expenseNum = data ? parseFloat(data.current_month_expenses) : 0
  const netNum = data ? parseFloat(data.current_month_net) : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
          <p className="mt-1 text-2xl font-bold font-number">
            {loading ? "..." : `${fmt(data?.total_balance ?? "0")}`}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-income)]">
            <TrendingUp className="h-4 w-4" /> Income
          </div>
          <p className="mt-1 text-2xl font-bold font-number text-[var(--color-income)]">
            {loading ? "..." : `${fmt(data?.current_month_income ?? "0")}`}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-expense)]">
            <TrendingDown className="h-4 w-4" /> Expenses
          </div>
          <p className="mt-1 text-2xl font-bold font-number text-[var(--color-expense)]">
            {loading ? "..." : `${fmt(data?.current_month_expenses ?? "0")}`}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" /> Net
          </div>
          <p className={`mt-1 text-2xl font-bold font-number ${netNum >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}>
            {loading ? "..." : `${netNum >= 0 ? "+" : "-"}${fmt(Math.abs(netNum))}`}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Income vs Expenses (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                <DonutChart income={incomeNum} expense={expenseNum} />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-income)]" />
                    <div>
                      <p className="text-xs text-muted-foreground">Income</p>
                      <p className="font-semibold font-number">{fmt(data?.current_month_income ?? "0")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-expense)]" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expenses</p>
                      <p className="font-semibold font-number">{fmt(data?.current_month_expenses ?? "0")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Net</p>
                      <p className={`font-semibold font-number ${netNum >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}>
                        {netNum >= 0 ? "+" : "-"}{fmt(Math.abs(netNum))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : data && data.top_spending_categories.length > 0 ? (
              <div className="space-y-3">
                {data.top_spending_categories.map((cat) => {
                  const pct = cat.percentage
                  return (
                    <div key={cat.category_id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{cat.icon || "📦"}</span>
                          <span className="font-medium">{cat.category_name}</span>
                          <Badge variant="outline" className="text-xs">{cat.transaction_count}</Badge>
                        </div>
                        <span className="font-number font-medium">{fmt(cat.total)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[var(--color-expense)] transition-all duration-300"
                          style={{ width: `${Math.min(pct * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 text-center">
                  <Link to="/reports" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    View all categories <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No expenses this month.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : data && data.recent_transactions.length > 0 ? (
            <div className="divide-y divide-border">
              {data.recent_transactions.map((txn) => (
                <Link
                  key={txn.id}
                  to={`/transactions/${txn.id}`}
                  className="flex items-center justify-between py-2.5 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="outline"
                      className={
                        txn.txn_type === "income"
                          ? "w-24 text-center border-[var(--color-income)] text-[var(--color-income)]"
                          : txn.txn_type === "expense"
                            ? "w-24 text-center border-[var(--color-expense)] text-[var(--color-expense)]"
                            : "w-24 text-center border-border text-muted-foreground"
                      }
                    >
                      {txn.txn_type}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{txn.description || txn.category_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDate(txn.txn_date)} · {txn.account_name}
                      </p>
                    </div>
                  </div>
                  <p className={`ml-4 font-number font-semibold shrink-0 ${
                    txn.txn_type === "income"
                      ? "text-[var(--color-income)]"
                      : txn.txn_type === "adjustment"
                        ? "text-muted-foreground"
                        : "text-[var(--color-expense)]"
                  }`}>
                    {txn.txn_type === "adjustment" ? "" : txn.txn_type === "income" ? "+" : "-"}{fmt(txn.amount)}
                  </p>
                </Link>
              ))}
              <div className="pt-2 text-center">
                <Link to="/transactions" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  View all transactions <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
