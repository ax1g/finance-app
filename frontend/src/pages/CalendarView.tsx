import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { fetchTransactions } from "@/api/transactions"
import type { TransactionRead } from "@/types"
import { fmt } from "@/lib/utils"

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }
  return days
}

function getDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default function CalendarView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [transactions, setTransactions] = useState<TransactionRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10)

  const loadingInitial = loading && transactions.length === 0

  useEffect(() => {
    let cancelled = false
    setSelectedDay(null)

    fetchTransactions({ start: startDate, end: endDate })
      .then((d) => {
        if (!cancelled) setTransactions(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [startDate, endDate])

  const txnByDay = useMemo(() => {
    const map = new Map<string, TransactionRead[]>()
    for (const txn of transactions) {
      const date = txn.txn_date.slice(0, 10)
      if (!map.has(date)) map.set(date, [])
      map.get(date)!.push(txn)
    }
    return map
  }, [transactions])

  const days = useMemo(() => getMonthDays(year, month), [year, month])

  const selectedTxn = selectedDay
    ? txnByDay.get(getDateStr(year, month, selectedDay)) ?? []
    : []

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              {new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingInitial ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </div>
          ) : error && transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-px">
                {WEEKDAY_HEADERS.map((h) => (
                  <div key={h} className="py-1.5 text-center text-xs font-medium text-muted-foreground">
                    {h}
                  </div>
                ))}
                {days.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} />
                  }
                  const dateStr = getDateStr(year, month, day)
                  const dayTxns = txnByDay.get(dateStr)
                  const count = dayTxns?.length ?? 0
                  const isToday = dateStr === todayStr
                  const isSelected = selectedDay === day

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center rounded-lg p-1.5 transition-colors min-h-[56px] ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                            ? "bg-accent"
                            : "hover:bg-muted/50"
                      }`}
                    >
                      <span className={`text-sm font-number ${isSelected ? "font-bold" : ""}`}>
                        {day}
                      </span>
                      {count > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayTxns!.some((t) => t.txn_type === "income") && (
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          )}
                          {dayTxns!.some((t) => t.txn_type === "expense") && (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedDay && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Transactions for {new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTxn.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No transactions on this day.</p>
            ) : (
              <div className="divide-y divide-border">
                {selectedTxn.map((txn) => (
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
                            ? "border-[var(--color-income)] text-[var(--color-income)]"
                            : txn.txn_type === "expense"
                              ? "border-[var(--color-expense)] text-[var(--color-expense)]"
                              : ""
                        }
                      >
                        {txn.txn_type}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{txn.description || txn.category.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {txn.account.name} · {txn.category.name}
                        </p>
                      </div>
                    </div>
                    <p className={`ml-4 font-number font-semibold shrink-0 ${txn.txn_type === "income" ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}>
                      {txn.txn_type === "income" ? "+" : "-"}${fmt(txn.amount)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
