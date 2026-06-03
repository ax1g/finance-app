import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart3, Wallet, TrendingUp, TrendingDown, Table2, PieChart, Download, FileText, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react"
import { fmt, formatDate } from "@/lib/utils"
import {
  fetchDashboard,
  fetchMonthlySummary,
  fetchSpendingByCategory,
  fetchAccountSummary,
  fetchIncomeStatement,
} from "@/api/reports"
import type {
  DashboardResponse,
  MonthlySummaryItem,
  SpendingByCategoryItem,
  AccountSummaryItem,
  IncomeStatementResponse,
  IncomeStatementItem,
} from "@/types"

function BalancesCard({ data }: { data: DashboardResponse | null }) {
  const items = data
    ? [
        { label: "Total Balance", value: data.total_balance, icon: Wallet, color: "text-foreground" },
        { label: "Income This Month", value: data.current_month_income, icon: TrendingUp, color: "text-[var(--color-income)]" },
        { label: "Expenses This Month", value: data.current_month_expenses, icon: TrendingDown, color: "text-[var(--color-expense)]" },
        { label: "Net This Month", value: data.current_month_net, icon: TrendingUp, color: parseFloat(data.current_month_net) >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]" },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-5 w-5" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className={`mt-1 text-lg font-bold font-number ${item.color}`}>
                ${fmt(item.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MonthlyTrends() {
  const [data, setData] = useState<MonthlySummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetchMonthlySummary(12)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <LoadingCard title="Monthly Trends" icon={<Table2 className="h-5 w-5" />} />
  if (error) return <ErrorCard title="Monthly Trends" error={error} />

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Table2 className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">No transaction data yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Table2 className="h-5 w-5" />
          Monthly Trends (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Month</th>
                <th className="pb-2 font-medium text-right">Income</th>
                <th className="pb-2 font-medium text-right">Expenses</th>
                <th className="pb-2 font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const net = parseFloat(row.net)
                return (
                  <tr key={row.year_month} className="border-b border-border/50">
                    <td className="py-2.5">{row.year_month}</td>
                    <td className="py-2.5 text-right font-number text-[var(--color-income)]">
                      ${fmt(row.income)}
                    </td>
                    <td className="py-2.5 text-right font-number text-[var(--color-expense)]">
                      ${fmt(row.expense)}
                    </td>
                    <td className={`py-2.5 text-right font-number ${net >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}>
                      {net >= 0 ? "+" : "-"}${fmt(Math.abs(net))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryBreakdown() {
  const [data, setData] = useState<SpendingByCategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    fetchSpendingByCategory(startDate, endDate)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [startDate, endDate])

  useEffect(() => load(), [load])

  const maxTotal = data.length > 0 ? Math.max(...data.map((d) => parseFloat(d.total))) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="h-5 w-5" />
          Spending by Category
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonth((m) => (m === 0 ? (setYear((y) => y - 1), 11) : m - 1))}>
            Prev
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setMonth((m) => (m === 11 ? (setYear((y) => y + 1), 0) : m + 1))}>
            Next
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingInline />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No expenses this month.</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const pct = parseFloat(item.total) / maxTotal * 100
              return (
                <div key={item.category_id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span>{item.icon || "📦"}</span>
                      <span className="font-medium">{item.category_name}</span>
                      <Badge variant="outline" className="text-xs">{item.transaction_count}</Badge>
                    </div>
                    <span className="font-number font-medium">${fmt(item.total)} ({item.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-expense)] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AccountSummaryCard() {
  const [data, setData] = useState<AccountSummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetchAccountSummary()
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <LoadingCard title="Account Summary" icon={<LandmarkIcon />} />
  if (error) return <ErrorCard title="Account Summary" error={error} />

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><LandmarkIcon /> Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">No accounts yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LandmarkIcon />
          Account Summary (This Month)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((acc) => (
            <div key={acc.account_id} className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <p className="text-sm font-medium">{acc.account_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{acc.account_type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-number">${fmt(acc.balance)}</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-[var(--color-income)]">+${fmt(acc.income_this_month)}</span>
                  <span className="text-[var(--color-expense)]">-${fmt(acc.expenses_this_month)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function IncomeStatement() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<IncomeStatementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    fetchIncomeStatement(year, month)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [year, month])

  useEffect(() => load(), [load])

  function exportCSV() {
    if (!data) return
    const rows = [
      ["Date", "Type", "Description", "Category", "Account", "Amount"],
      ...data.income_transactions.map((t) => [
        t.txn_date.slice(0, 10),
        t.txn_type,
        t.description ?? "",
        t.category_name,
        t.account_name,
        t.amount,
      ]),
      ...data.expense_transactions.map((t) => [
        t.txn_date.slice(0, 10),
        t.txn_type,
        t.description ?? "",
        t.category_name,
        t.account_name,
        t.amount,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `income-statement-${year}-${String(month).padStart(2, "0")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1) }
    else setMonth((m) => m + 1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Income Statement
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              for the month of {new Date(year, month - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={exportCSV} title="Export CSV">
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" disabled title="Export PDF">
                <FileText className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button variant="outline" size="sm" disabled title="Export XLSX">
                <FileSpreadsheet className="h-4 w-4 mr-1" /> XLSX
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingInline />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Income</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>Opening Balance</span>
                    <span className="font-number font-medium">${fmt(data.opening_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Income</span>
                    <span className="font-number font-medium text-[var(--color-income)]">${fmt(data.total_income)}</span>
                  </div>
                  <hr className="my-2 border-border" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="font-number">${fmt(parseFloat(data.opening_balance) + parseFloat(data.total_income))}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Expenses</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>Closing Balance</span>
                    <span className="font-number font-medium">${fmt(data.closing_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses</span>
                    <span className="font-number font-medium text-[var(--color-expense)]">-${fmt(data.total_expenses)}</span>
                  </div>
                  <hr className="my-2 border-border" />
                  <div className="flex justify-between font-semibold">
                    <span>Net</span>
                    <span className={`font-number ${parseFloat(data.net) >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}>
                      {parseFloat(data.net) >= 0 ? "+" : "-"}${fmt(Math.abs(parseFloat(data.net)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail tables */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Income Transactions</h3>
                {data.income_transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No income this month.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="pb-1.5 pr-2 font-medium">Date</th>
                          <th className="pb-1.5 pr-2 font-medium">Particulars</th>
                          <th className="pb-1.5 pr-2 font-medium">Category</th>
                          <th className="pb-1.5 pr-2 font-medium">Mode</th>
                          <th className="pb-1.5 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.income_transactions.map((t, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-1.5 pr-2 whitespace-nowrap font-number">{t.txn_date.slice(0, 10)}</td>
                            <td className="py-1.5 pr-2">{t.description ?? "—"}</td>
                            <td className="py-1.5 pr-2">{t.category_name}</td>
                            <td className="py-1.5 pr-2">{t.account_name}</td>
                            <td className="py-1.5 text-right font-number text-[var(--color-income)]">${fmt(t.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Expense Transactions</h3>
                {data.expense_transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No expenses this month.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="pb-1.5 pr-2 font-medium">Date</th>
                          <th className="pb-1.5 pr-2 font-medium">Particulars</th>
                          <th className="pb-1.5 pr-2 font-medium">Category</th>
                          <th className="pb-1.5 pr-2 font-medium">Mode</th>
                          <th className="pb-1.5 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.expense_transactions.map((t, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-1.5 pr-2 whitespace-nowrap font-number">{t.txn_date.slice(0, 10)}</td>
                            <td className="py-1.5 pr-2">{t.description ?? "—"}</td>
                            <td className="py-1.5 pr-2">{t.category_name}</td>
                            <td className="py-1.5 pr-2">{t.account_name}</td>
                            <td className="py-1.5 text-right font-number text-[var(--color-expense)]">-${fmt(t.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function LandmarkIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01" /><path d="M15 9v.01" />
    </svg>
  )
}

function LoadingCard({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ title, error }: { title: string; error: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">{error}</p>
      </CardContent>
    </Card>
  )
}

function LoadingInline() {
  return (
    <div className="flex items-center justify-center py-6 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading...
    </div>
  )
}

export default function Reports() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [dashLoading, setDashLoading] = useState(true)
  const [dashError, setDashError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetchDashboard()
      .then((d) => { if (!cancelled) setDashboardData(d) })
      .catch((err) => { if (!cancelled) setDashError(err.message) })
      .finally(() => { if (!cancelled) setDashLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports & Insights</h1>

      {dashLoading ? (
        <LoadingCard title="Summary" icon={<BarChart3 className="h-5 w-5" />} />
      ) : dashError ? (
        <ErrorCard title="Summary" error={dashError} />
      ) : (
        <BalancesCard data={dashboardData} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyTrends />
        <CategoryBreakdown />
      </div>

      <IncomeStatement />

      <AccountSummaryCard />
    </div>
  )
}
