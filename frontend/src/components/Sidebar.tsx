import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  BarChart3,
  Calendar,
  Landmark,
  Tag,
  History,
  Plus,
  Settings,
  Snowflake,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useModal } from "@/context/ModalContext";
import TransactionFormModal from "@/components/TransactionFormModal";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  }`;

function NavLabel({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <div
      className={`overflow-hidden whitespace-nowrap min-w-0 transition-[max-width] duration-300 ${
        collapsed ? "max-w-0" : "max-w-60"
      }`}
    >
      {children}
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { openModal } = useModal();

  return (
    <aside
      className={`relative hidden flex-col border-r border-border bg-card transition-all duration-300 md:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 flex size-5 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className={`size-3 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
      </button>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Snowflake className="h-6 w-6 shrink-0 text-primary" />
        <NavLabel collapsed={collapsed}>
          <span className="font-bold text-xl text-foreground whitespace-nowrap">
            Neco
          </span>
        </NavLabel>
      </div>
      <div className="flex-1 space-y-1 px-3 pt-3">
        <button
          onClick={() => openModal("new-transaction", <TransactionFormModal />)}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Plus className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">New Transaction</span>
          </NavLabel>
        </button>
        <NavLink to="/" end className={linkClass}>
          <LayoutGrid className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Dashboard</span>
          </NavLabel>
        </NavLink>
        <NavLink to="/reports" end className={linkClass}>
          <BarChart3 className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Reports</span>
          </NavLabel>
        </NavLink>
        <NavLink to="/calendar" end className={linkClass}>
          <Calendar className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Calendar</span>
          </NavLabel>
        </NavLink>
        <NavLink to="/accounts" end className={linkClass}>
          <Landmark className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Accounts</span>
          </NavLabel>
        </NavLink>
        <NavLink to="/categories" end className={linkClass}>
          <Tag className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Categories</span>
          </NavLabel>
        </NavLink>
        <NavLink to="/transactions" end className={linkClass}>
          <History className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Transaction History</span>
          </NavLabel>
        </NavLink>
      </div>

      <div className="border-t border-border p-3">
        <NavLink to="/settings" className={linkClass}>
          <Settings className="h-6 w-6 shrink-0" />
          <NavLabel collapsed={collapsed}>
            <span className="ml-4 whitespace-nowrap">Settings</span>
          </NavLabel>
        </NavLink>
      </div>
    </aside>
  );
}
