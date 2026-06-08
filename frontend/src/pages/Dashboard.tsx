import { useEffect, useState, useRef } from "react"
import { fetchDashboard } from "@/api/reports"
import type { DashboardResponse } from "@/types"
import { useDataRefresh } from "@/context/DataRefreshContext"
import { useToast } from "@/context/ToastContext"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Loader2, TrendingUp, PieChart as PieChartIcon,
  ArrowRight, ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  Eye, EyeOff,
} from "lucide-react"
import { fmt, formatDate } from "@/lib/utils"
import { Link } from "react-router-dom"

function AnimatedNumber({ value, visible }: { value: string; visible: boolean }) {
  const [display, setDisplay] = useState("$0.00")
  const started = useRef(false)
  const target = parseFloat(value)

  useEffect(() => {
    if (!visible) return
    if (started.current) { setDisplay(fmt(value)); return }
    started.current = true

    const duration = 800
    const steps = 30
    const step = target / steps
    let current = 0
    let i = 0

    const timer = setInterval(() => {
      i++
      current += step
      if (i >= steps) {
        setDisplay(fmt(value))
        clearInterval(timer)
      } else {
        setDisplay(fmt(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, visible])

  return <span>{display}</span>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [showBalance, setShowBalance] = useState(true)
  const [historyRange, setHistoryRange] = useState<"1M" | "1Y" | "ALL">("1Y")
  const { version } = useDataRefresh()
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false

    fetchDashboard()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })

    return () => {
      cancelled = true
    }
  }, [version.transactions, version.accounts])

  const loading = data === null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    )
  }

  const totalAssets = data ? parseFloat(data.total_assets) : 0
  const totalLiabilities = data ? parseFloat(data.total_liabilities) : 0

  const historyData = data?.networth_history ?? []
  const slicedHistory = historyRange === "1M" ? historyData.slice(-2) : historyRange === "1Y" ? historyData.slice(-12) : historyData

  const chartData = slicedHistory.map((h) => ({
    label: h.date,
    value: parseFloat(h.net_worth),
  }))

  const assetColors: Record<string, string> = {
    cash: "oklch(0.7 0.18 150)",
    bank: "oklch(0.55 0.16 155)",
    investment: "oklch(0.42 0.12 145)",
    receivables: "oklch(0.3 0.08 140)",
    payables: "var(--color-expense)",
  }

  const assetLabels: Record<string, string> = {
    cash: "Cash",
    bank: "Bank",
    investment: "Investment",
    receivables: "Receivables",
  }

  const balanceByType = data?.balance_by_type ?? []
  const assetTypes = balanceByType.filter(
    (b) => b.account_type !== "payables" && parseFloat(b.balance) > 0
  )
  const hasAssets = assetTypes.length > 0

  const chartConfig: ChartConfig = Object.fromEntries(
    assetTypes.map((b) => [
      b.account_type,
      { label: assetLabels[b.account_type] || b.account_type, color: assetColors[b.account_type] },
    ])
  )

  const pieData = assetTypes.map((b) => ({
    name: assetLabels[b.account_type] || b.account_type,
    value: parseFloat(b.balance),
    color: assetColors[b.account_type],
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <Card className="animate-fade-in overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--color-income)]/10 via-transparent to-[var(--color-expense)]/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
              <p className="mt-2 text-4xl font-bold font-number tracking-tight truncate">
                {loading ? "..." : showBalance ? (
                  <AnimatedNumber value={data?.total_balance ?? "0"} visible={showBalance} />
                ) : (
                  <span className="tracking-[0.05em]">{fmt(data?.total_balance ?? "0").replace(/\S/g, "•")}</span>
                )}
              </p>
            </div>
            {!loading && (
              <button
                onClick={() => setShowBalance((s) => !s)}
                className="mt-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          {!loading && data && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--color-income)]" />
                <span className="text-muted-foreground">Assets</span>
                <span className="font-number font-semibold text-foreground">
                  {showBalance ? fmt(totalAssets) : fmt(totalAssets).replace(/\S/g, "•")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--color-expense)]" />
                <span className="text-muted-foreground">Liabilities</span>
                <span className="font-number font-semibold text-foreground">
                  {showBalance ? fmt(totalLiabilities) : fmt(totalLiabilities).replace(/\S/g, "•")}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Net Worth Progress
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            {(["1M", "1Y", "ALL"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setHistoryRange(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  historyRange === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "1M" ? "Month" : p === "1Y" ? "Year" : "All Time"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : !data?.networth_history?.length ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No history yet
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="label"
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    dy={14}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    tickFormatter={(v) => fmt(v).charAt(0) === "$" ? `$${(v / 1000).toFixed(0)}k` : `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const val = payload[0].value as number
                      return (
                        <div className="rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md">
                          <p className="font-number font-semibold">{fmt(val)}</p>
                        </div>
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-income)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, className: "fill-[var(--color-income)] stroke-background stroke-2" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Net Worth Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : !hasAssets ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No accounts yet
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square h-[200px] w-[200px]"
                >
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="var(--background)"
                      paddingAngle={2}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <div>
                        <p className="text-xs text-muted-foreground">{entry.name}</p>
                        <p className="font-semibold font-number">{fmt(entry.value)}</p>
                      </div>
                    </div>
                  ))}
                  {totalLiabilities > 0 && (
                    <>
                      <div className="my-2 border-t border-border" />
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-[var(--color-expense)]" />
                        <div>
                          <p className="text-xs text-muted-foreground">Liabilities</p>
                          <p className="font-semibold font-number text-[var(--color-expense)]">
                            -{fmt(totalLiabilities)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </div>
            ) : data && data.recent_transactions.length > 0 ? (
              <div>
                {data.recent_transactions.map((txn, i) => (
                  <Link
                    key={txn.id}
                    to={`/transactions/${txn.id}`}
                    className={`flex items-center justify-between px-6 py-2.5 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                      i < data.recent_transactions.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
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
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        ) : txn.txn_type === "adjustment" ? (
                          <span className="text-[10px] font-bold">~</span>
                        ) : txn.txn_type === "transfer" ? (
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {txn.description || txn.category_name || "Transfer"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {txn.txn_type === "transfer" ? (
                            <>{txn.account_name} <ArrowRight className="inline h-2.5 w-2.5" /> {txn.to_account_name || "?"}</>
                          ) : (
                            txn.account_name
                          )}
                          &nbsp;&middot;&nbsp;{formatDate(txn.txn_date)}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 font-number text-sm font-medium ${
                      txn.txn_type === "expense"
                        ? "text-[var(--color-expense)]"
                        : txn.txn_type === "adjustment"
                          ? "text-muted-foreground"
                          : txn.txn_type === "transfer"
                            ? "text-primary"
                            : "text-[var(--color-income)]"
                    }`}>
                      {txn.txn_type === "adjustment" || txn.txn_type === "transfer" ? fmt(txn.amount) : txn.txn_type === "expense" ? `-${fmt(txn.amount)}` : `+${fmt(txn.amount)}`}
                    </span>
                  </Link>
                ))}
                <div className="border-t border-border px-6 py-2 text-center">
                  <Link to="/transactions" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
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
    </div>
  )
}
