import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { fetchAccounts } from "@/api/accounts"
import type { AccountRead } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Landmark, Building2, PiggyBank, Handshake, Banknote, Loader2, Plus } from "lucide-react"

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  bank: <Landmark className="h-5 w-5" />,
  investment: <PiggyBank className="h-5 w-5" />,
  receivables: <Handshake className="h-5 w-5" />,
  payables: <Building2 className="h-5 w-5" />,
}

const ACCOUNT_COLORS: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  bank: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  investment: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  receivables: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  payables: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
}

export default function AccountList() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<AccountRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    fetchAccounts()
      .then((data) => {
        if (!cancelled) setAccounts(data)
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
  }, [])

  const totalBalance = accounts.reduce(
    (sum, a) => sum + parseFloat(a.current_balance),
    0,
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Accounts</CardTitle>
        <div className="flex items-center gap-3">
          {!loading && !error && (
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                ${totalBalance.toFixed(2)}
              </span>
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/accounts/new")}>
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
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
        {!loading && !error && accounts.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No accounts yet.{" "}
            <Link
              to="/accounts/new"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        )}
        {!loading && !error && accounts.length > 0 && (
          <div className="space-y-2">
            {accounts.map((a) => (
              <Link
                key={a.id}
                to={`/accounts/${a.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${ACCOUNT_COLORS[a.type] || ACCOUNT_COLORS.bank}`}
                  >
                    {ACCOUNT_ICONS[a.type] || ACCOUNT_ICONS.bank}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{a.name}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {a.type}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-sm">
                  ${parseFloat(a.current_balance).toFixed(2)}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
