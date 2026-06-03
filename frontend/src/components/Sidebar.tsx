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
} from "lucide-react";
import { useState } from "react";
import LogoIcon from "@/components/LogoIcon";
import { useModal } from "@/context/ModalContext";
import TransactionFormModal from "@/components/TransactionFormModal";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
      className={`flex flex-col border-r border-border bg-card transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex h-14 w-full items-center border-b border-border pl-3 pr-3 text-left transition-colors hover:bg-accent/50"
      >
        <LogoIcon size={24} />
        <NavLabel collapsed={collapsed}>
          <span className="ml-4 font-display font-bold text-sm tracking-wide text-foreground whitespace-nowrap">
            Maester of Coins
          </span>
        </NavLabel>
      </button>

      <div className="flex-1 space-y-1 px-3 pt-5">
        <button
          onClick={() => openModal("new-transaction", <TransactionFormModal />)}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
