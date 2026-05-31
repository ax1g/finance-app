import { NavLink } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  Wallet,
  LayoutList,
  Landmark,
  Tag,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { useState } from "react"

export default function Sidebar() {
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    }`

  return (
    <aside
      className={`flex flex-col border-r border-border bg-card transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center border-b border-border px-3">
        <NavLink
          to="/transactions"
          className="flex items-center gap-3 overflow-hidden"
        >
          <Wallet className="h-6 w-6 shrink-0" />
          {!collapsed && <span className="font-semibold">Finance</span>}
        </NavLink>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto shrink-0"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 space-y-1 p-3">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {!collapsed && "Transactions"}
        </p>
        <NavLink to="/transactions" end className={linkClass}>
          <LayoutList className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Transactions</span>}
        </NavLink>
        <div className="my-3" />
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {!collapsed && "Accounts"}
        </p>
        <NavLink to="/accounts" end className={linkClass}>
          <Landmark className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Accounts</span>}
        </NavLink>
        <NavLink to="/categories" end className={linkClass}>
          <Tag className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Categories</span>}
        </NavLink>
      </div>

      <div className="border-t border-border p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  )
}
