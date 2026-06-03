import { useEffect, useState } from "react"
import { fetchDashboardData, type DashboardData } from "@/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react"

type Period = "week" | "month" | "year" | "all"

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all", label: "All Time" },
]

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
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState<Period>("month")

  useEffect(() => {
    let cancelled = false

    fetchDashboardData(period)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [period])

  const loading = data === null && !error

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">{error}</p>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
        <p className="mt-1 text-3xl font-bold font-number">
          {loading
            ? "..."
            : `$${(data?.netWorth ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-income)]/10 text-[var(--color-income)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assets</p>
              <p className="text-sm font-semibold font-number">
                ${(data?.totalAssets ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-expense)]/10 text-[var(--color-expense)]">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Liabilities</p>
              <p className="text-sm font-semibold font-number">
                ${(data?.totalLiabilities ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Income vs Expenses
          </CardTitle>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
              <DonutChart
                income={data?.totalIncome ?? 0}
                expense={data?.totalExpense ?? 0}
              />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-income)]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="font-semibold font-number">
                      ${(data?.totalIncome ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-expense)]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="font-semibold font-number">
                      ${(data?.totalExpense ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Net</p>
                    <p
                      className={`font-semibold font-number ${
                        (data?.totalIncome ?? 0) - (data?.totalExpense ?? 0) >= 0
                          ? "text-[var(--color-income)]"
                          : "text-[var(--color-expense)]"
                      }`}
                    >
                      {((data?.totalIncome ?? 0) - (data?.totalExpense ?? 0) >= 0 ? "+" : "-")}$
                      {Math.abs(
                        (data?.totalIncome ?? 0) - (data?.totalExpense ?? 0),
                      ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
