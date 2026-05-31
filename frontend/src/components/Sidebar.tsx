import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  LayoutDashboard,
  BarChart3,
  Landmark,
  Tag,
  History,
  Plus,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { useState } from "react"

export default function Sidebar() {
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
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
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

      <div className="px-3 pb-4 pt-5">
        <NavLink
          to="/transactions/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:from-primary/90 hover:to-primary/70 hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>New Transaction</span>}
        </NavLink>
      </div>

      <div className="flex-1 space-y-1 px-3">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink to="/reports" end className={linkClass}>
          <BarChart3 className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Reports</span>}
        </NavLink>
        <NavLink to="/accounts" end className={linkClass}>
          <Landmark className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Accounts</span>}
        </NavLink>
        <NavLink to="/categories" end className={linkClass}>
          <Tag className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Categories</span>}
        </NavLink>
        <NavLink to="/transactions" end className={linkClass}>
          <History className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Transaction History</span>}
        </NavLink>
      </div>

      <div className="border-t border-border p-3">
        <NavLink to="/settings" className={linkClass}>
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  )
}
