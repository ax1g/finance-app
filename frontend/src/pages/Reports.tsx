import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  BarChart3,
  TrendingUp,
  PieChart,
  Upload,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Landmark,
  PiggyBank,
  Handshake,
  Building2,
} from "lucide-react";
import { fmt } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import {
  fetchDashboard,
  fetchMonthlySummary,
  fetchIncomeByCategory,
  fetchSpendingByCategory,
  fetchAccountSummary,
  fetchIncomeStatement,
} from "@/api/reports";
import type {
  DashboardResponse,
  MonthlySummaryItem,
  SpendingByCategoryItem,
  AccountSummaryItem,
  IncomeStatementResponse,
} from "@/types";

function BalancesCard({ data }: { data: DashboardResponse | null }) {
  if (!data) return null;

  const net = parseFloat(data.current_month_net);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
      <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Income This Month
        </p>
        <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold font-number tracking-tight text-[var(--color-income)] truncate">
          {fmt(data.current_month_income)}
        </p>
      </div>
      <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Expenses This Month
        </p>
        <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold font-number tracking-tight text-[var(--color-expense)] truncate">
          {fmt(data.current_month_expenses)}
        </p>
      </div>
      <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Net This Month
        </p>
        <p
          className={`mt-2 sm:mt-3 text-xl sm:text-3xl font-bold font-number tracking-tight truncate ${net >= 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"}`}
        >
          {net >= 0 ? "+" : ""}
          {fmt(Math.abs(net))}
        </p>
      </div>
    </div>
  );
}

function MonthlyTrends() {
  const [data, setData] = useState<MonthlySummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchMonthlySummary(12)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <LoadingCard
        title="Monthly Trends"
        icon={<BarChart3 className="h-5 w-5" />}
      />
    );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transaction data yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((row) => ({
    label: row.year_month,
    income: parseFloat(row.income),
    expense: parseFloat(row.expense),
    net: parseFloat(row.net),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5" />
          Monthly Trends (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-surface]:bg-transparent [&_.recharts-bar-rectangle]:hover:opacity-80 [&_.recharts-default-tooltip]:!bg-background">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
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
                tickFormatter={(v) =>
                  fmt(v).charAt(0) === "$"
                    ? `$${(v / 1000).toFixed(0)}k`
                    : `${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md space-y-1">
                      <p className="font-medium text-foreground">{label}</p>
                      {payload.map((entry) => (
                        <div
                          key={entry.name}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground capitalize">
                            {entry.name}:
                          </span>
                          <span className="font-number font-medium">
                            {fmt(entry.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBreakdown() {
  const [data, setData] = useState<SpendingByCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { toast } = useToast();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSpendingByCategory(startDate, endDate)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const maxTotal =
    data.length > 0 ? Math.max(...data.map((d) => parseFloat(d.total))) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="h-5 w-5" />
          Spending by Category
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 0) {
                setYear((y) => y - 1);
                setMonth(11);
              } else setMonth((m) => m - 1);
            }}
          >
            Prev
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {new Date(year, month).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 11) {
                setYear((y) => y + 1);
                setMonth(0);
              } else setMonth((m) => m + 1);
            }}
          >
            Next
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingInline />
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No expenses this month.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const pct = (parseFloat(item.total) / maxTotal) * 100;
              return (
                <div key={item.category_id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span>{item.icon || "📦"}</span>
                      <span className="font-medium">{item.category_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.transaction_count}
                      </Badge>
                    </div>
                    <span className="font-number font-medium">
                      {fmt(item.total)} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-expense)] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const accountGroupMeta: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  cash: {
    label: "Cash",
    icon: <Banknote className="h-5 w-5" />,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  bank: {
    label: "Bank",
    icon: <Landmark className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  investment: {
    label: "Investment",
    icon: <PiggyBank className="h-5 w-5" />,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  receivables: {
    label: "Receivables",
    icon: <Handshake className="h-5 w-5" />,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  payables: {
    label: "Payables",
    icon: <Building2 className="h-5 w-5" />,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

function AccountSummaryCard() {
  const [data, setData] = useState<AccountSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { toast } = useToast();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAccountSummary(startDate, endDate)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  if (loading) return <LoadingCard title="Accounts" icon={<LandmarkIcon />} />;

  const grouped: Record<string, AccountSummaryItem[]> = {};
  for (const acc of data) {
    if (!grouped[acc.account_type]) grouped[acc.account_type] = [];
    grouped[acc.account_type].push(acc);
  }

  const typeOrder = ["cash", "bank", "investment", "receivables", "payables"];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <LandmarkIcon />
            Account Summary
          </CardTitle>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (month === 0) {
                  setYear((y) => y - 1);
                  setMonth(11);
                } else setMonth((m) => m - 1);
              }}
            >
              Prev
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {new Date(year, month).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (month === 11) {
                  setYear((y) => y + 1);
                  setMonth(0);
                } else setMonth((m) => m + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No accounts yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {typeOrder.map((type) => {
              const accounts = grouped[type];
              if (!accounts) return null;
              const meta = accountGroupMeta[type];
              const groupIncome = accounts.reduce(
                (s, a) => s + parseFloat(a.income_this_month),
                0,
              );
              const groupExpenses = accounts.reduce(
                (s, a) => s + parseFloat(a.expenses_this_month),
                0,
              );
              const typeTotal = accounts.reduce(
                (s, a) => s + parseFloat(a.balance_as_of_end),
                0,
              );
              return (
                <div
                  key={type}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${meta.color}`}
                      >
                        {meta.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {meta.label}
                        </p>
                        <p className="text-xs font-number text-muted-foreground">
                          {fmt(typeTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-number text-[var(--color-income)]">
                        +{fmt(groupIncome)}
                      </p>
                      <p className="text-xs font-number text-[var(--color-expense)]">
                        -{fmt(groupExpenses)}
                      </p>
                    </div>
                  </div>
                  {accounts.length > 0 && (
                    <>
                      <div className="mt-2.5 border-t border-border" />
                      <div className="mt-2 space-y-1">
                        {accounts.map((acc) => (
                          <div
                            key={acc.account_id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="text-muted-foreground truncate min-w-0">
                              {acc.account_name}
                            </span>
                            <span className="font-number font-medium shrink-0">
                              {fmt(acc.balance_as_of_end)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeByCategory() {
  const [data, setData] = useState<SpendingByCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { toast } = useToast();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchIncomeByCategory(startDate, endDate)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const maxTotal =
    data.length > 0 ? Math.max(...data.map((d) => parseFloat(d.total))) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5" />
          Income by Category
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 0) {
                setYear((y) => y - 1);
                setMonth(11);
              } else setMonth((m) => m - 1);
            }}
          >
            Prev
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {new Date(year, month).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 11) {
                setYear((y) => y + 1);
                setMonth(0);
              } else setMonth((m) => m + 1);
            }}
          >
            Next
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingInline />
        ) : data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No income this month.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const pct = (parseFloat(item.total) / maxTotal) * 100;
              return (
                <div key={item.category_id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span>{item.icon || "📦"}</span>
                      <span className="font-medium">{item.category_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.transaction_count}
                      </Badge>
                    </div>
                    <span className="font-number font-medium">
                      {fmt(item.total)} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-income)] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeStatement() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<IncomeStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchIncomeStatement(year, month)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  function exportCSV() {
    if (!data) return;
    const monthLabel = new Date(year, month - 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const rows = [
      [`Monthly Statement - ${monthLabel}`],
      [""],
      ["Opening Balance", data.opening_balance],
      ["Total Income", data.total_income],
      ["Total Expenses", data.total_expenses],
      ["Net", data.net],
      ["Closing Balance", data.closing_balance],
      [""],
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
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-statement-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Monthly Statement</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              For the month of{" "}
              {new Date(year, month - 1).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold min-w-[160px] text-center select-none">
                {new Date(year, month - 1).toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div ref={exportRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportOpen((o) => !o)}
              >
                <Upload className="h-4 w-4 mr-1" /> Export
              </Button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border bg-background p-1 shadow-md">
                  <button
                    onClick={exportCSV}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> CSV
                  </button>
                  <button
                    disabled
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground cursor-not-allowed"
                  >
                    <FileText className="h-4 w-4" /> PDF
                  </button>
                  <button
                    disabled
                    className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground cursor-not-allowed"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> XLSX
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingInline />
        ) : data ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="rounded-lg bg-muted p-4 sm:p-6">
                <h3 className="text-base sm:text-xl font-semibold text-muted-foreground mb-3 sm:mb-4">
                  Income
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground truncate">
                      Opening Balance
                    </span>
                    <span className="font-number text-base sm:text-xl font-semibold shrink-0">
                      {fmt(data.opening_balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground truncate">
                      Total Income
                    </span>
                    <span className="font-number text-base sm:text-xl font-semibold text-[var(--color-income)] shrink-0">
                      {fmt(data.total_income)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4 sm:p-6">
                <h3 className="text-base sm:text-xl font-semibold text-muted-foreground mb-3 sm:mb-4">
                  Expenses
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground truncate">
                      Total Expenses
                    </span>
                    <span className="font-number text-base sm:text-xl font-semibold text-[var(--color-expense)] shrink-0">
                      -{fmt(data.total_expenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground truncate">
                      Closing Balance
                    </span>
                    <span className="font-number text-base sm:text-xl font-semibold shrink-0">
                      {fmt(data.closing_balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail tables */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Income Transactions
                </h3>
                <div className="min-h-0">
                  {data.income_transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No income this month.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="pb-1.5 pr-2 font-medium">Date</th>
                            <th className="pb-1.5 pr-2 font-medium">
                              Particulars
                            </th>
                            <th className="pb-1.5 pr-2 font-medium">
                              Category
                            </th>
                            <th className="pb-1.5 pr-2 font-medium">Mode</th>
                            <th className="pb-1.5 text-right font-medium">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.income_transactions.map((t, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-1.5 pr-2 whitespace-nowrap font-number">
                                {t.txn_date.slice(0, 10)}
                              </td>
                              <td className="py-1.5 pr-2">
                                {t.description ?? "—"}
                              </td>
                              <td className="py-1.5 pr-2">{t.category_name}</td>
                              <td className="py-1.5 pr-2">{t.account_name}</td>
                              <td className="py-1.5 text-right font-number text-[var(--color-income)]">
                                {fmt(t.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Expense Transactions
                </h3>
                <div className="min-h-0">
                  {data.expense_transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No expenses this month.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="pb-1.5 pr-2 font-medium">Date</th>
                            <th className="pb-1.5 pr-2 font-medium">
                              Particulars
                            </th>
                            <th className="pb-1.5 pr-2 font-medium">
                              Category
                            </th>
                            <th className="pb-1.5 pr-2 font-medium">Mode</th>
                            <th className="pb-1.5 text-right font-medium">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.expense_transactions.map((t, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-1.5 pr-2 whitespace-nowrap font-number">
                                {t.txn_date.slice(0, 10)}
                              </td>
                              <td className="py-1.5 pr-2">
                                {t.description ?? "—"}
                              </td>
                              <td className="py-1.5 pr-2">{t.category_name}</td>
                              <td className="py-1.5 pr-2">{t.account_name}</td>
                              <td className="py-1.5 text-right font-number text-[var(--color-expense)]">
                                -{fmt(t.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LandmarkIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01" />
      <path d="M15 9v.01" />
    </svg>
  );
}

function LoadingCard({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingInline() {
  return (
    <div className="flex items-center justify-center py-6 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading...
    </div>
  );
}

export default function Reports() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [dashLoading, setDashLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchDashboard()
      .then((d) => {
        if (!cancelled) setDashboardData(d);
      })
      .catch((err) => {
        if (!cancelled) toast({ title: "Error", description: err.message, variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setDashLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Reports & Insights
      </h1>

      {dashLoading ? (
        <LoadingCard title="Summary" icon={<BarChart3 className="h-5 w-5" />} />
      ) : (
        <BalancesCard data={dashboardData} />
      )}

      <MonthlyTrends />

      <AccountSummaryCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IncomeByCategory />
        <CategoryBreakdown />
      </div>

      <IncomeStatement />
    </div>
  );
}
