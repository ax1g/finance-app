import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchAccounts } from "@/api/accounts";
import { useDataRefresh } from "@/context/DataRefreshContext";
import type { AccountRead } from "@/types";
import { Button } from "@/components/ui/button";
import { useModal } from "@/context/ModalContext";
import QuickAccountModal from "@/components/QuickAccountModal";
import { fmt } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Landmark,
  Building2,
  PiggyBank,
  Handshake,
  Banknote,
  Loader2,
  Plus,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  cash: {
    label: "Cash",
    icon: <Banknote className="h-5 w-5" />,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  bank: {
    label: "Bank",
    icon: <Landmark className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  investment: {
    label: "Investments",
    icon: <PiggyBank className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  receivables: {
    label: "Receivables",
    icon: <Handshake className="h-5 w-5" />,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  payables: {
    label: "Payables",
    icon: <Building2 className="h-5 w-5" />,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

const ASSET_TYPES = ["cash", "bank", "investment", "receivables"];
const LIABILITY_TYPES = ["payables"];

function AccountsModal({ accounts }: { accounts: AccountRead[] }) {
  return (
    <div className="space-y-1">
      {accounts.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">No accounts yet.</p>
      ) : (
        accounts.map((a) => (
          <Link
            key={a.id}
            to={`/accounts/${a.id}`}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <span>{a.name}</span>
            <span className="font-number tabular-nums font-medium">{fmt(a.current_balance)}</span>
          </Link>
        ))
      )}
    </div>
  );
}

function TypeCard({ type, accounts, onView }: { type: string; accounts: AccountRead[]; onView: () => void }) {
  const meta = TYPE_META[type];
  const total = accounts.reduce((s, a) => s + parseFloat(a.current_balance), 0);

  return (
    <Card className="divide-y divide-border">
      <button
        onClick={onView}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-xs text-muted-foreground">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-number text-sm font-semibold">{fmt(total)}</p>
        </div>
      </button>
    </Card>
  );
}

function TypeSection({
  type,
  accounts,
  open,
  onToggle,
}: {
  type: string;
  accounts: AccountRead[];
  open: boolean;
  onToggle: () => void;
}) {
  const meta = TYPE_META[type];
  const total = accounts.reduce((s, a) => s + parseFloat(a.current_balance), 0);

  return (
    <Card className="divide-y divide-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-xs text-muted-foreground">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-number text-sm font-semibold">{fmt(total)}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="px-4 py-2">
          {accounts.length === 0 ? (
            <p className="py-2 text-xs text-muted-foreground">No {meta.label.toLowerCase()} accounts yet.</p>
          ) : (
            <div className="space-y-0.5">
              {accounts.map((a) => (
                <Link
                  key={a.id}
                  to={`/accounts/${a.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/50"
                >
                  <span>{a.name}</span>
                  <span className="font-number tabular-nums">{fmt(a.current_balance)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function SectionGrid({
  title,
  types,
  accounts,
  onViewType,
}: {
  title: string;
  types: string[];
  accounts: AccountRead[];
  onViewType: (type: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {types.map((type) => {
          const typeAccounts = accounts.filter((a) => a.type === type);
          return (
            <TypeCard
              key={type}
              type={type}
              accounts={typeAccounts}
              onView={() => onViewType(type)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SectionList({
  title,
  types,
  accounts,
  expanded,
  onToggle,
}: {
  title: string;
  types: string[];
  accounts: AccountRead[];
  expanded: Set<string>;
  onToggle: (type: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-4">
        {types.map((type) => (
          <TypeSection
            key={type}
            type={type}
            accounts={accounts.filter((a) => a.type === type)}
            open={expanded.has(type)}
            onToggle={() => onToggle(type)}
          />
        ))}
      </div>
    </div>
  );
}

export default function AccountList() {
  const { openModal } = useModal();
  const { version } = useDataRefresh();
  const [accounts, setAccounts] = useState<AccountRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["cash", "bank"]));

  const loadAccounts = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAccounts()
      .then((data) => setAccounts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [version.accounts]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openCreateModal = () => {
    openModal(
      "new-account-list",
      <QuickAccountModal
        onCreated={() => {
          loadAccounts();
        }}
      />,
    );
  };

  const viewTypeAccounts = (type: string) => {
    const meta = TYPE_META[type];
    const typeAccounts = accounts.filter((a) => a.type === type);
    openModal(
      `view-${type}`,
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.color}`}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-semibold">{meta.label}</p>
            <p className="text-xs text-muted-foreground">{typeAccounts.length} accounts</p>
          </div>
        </div>
        <AccountsModal accounts={typeAccounts} />
      </div>,
    );
  };

  const toggleType = (type: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const netAssets = ASSET_TYPES.reduce(
    (sum, type) =>
      sum + accounts.filter((a) => a.type === type).reduce((s, a) => s + parseFloat(a.current_balance), 0),
    0,
  );

  const netLiabilities = accounts
    .filter((a) => a.type === "payables")
    .reduce((s, a) => s + parseFloat(a.current_balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {!loading && !error && (
            <p className="text-sm text-muted-foreground">
              Net:{" "}
              <span
                className={`font-semibold font-number ${
                  netAssets - netLiabilities >= 0
                    ? "text-[var(--color-income)]"
                    : "text-[var(--color-expense)]"
                }`}
              >
                {fmt(netAssets - netLiabilities)}
              </span>
            </p>
          )}
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-l-md p-1.5 transition-colors ${
                viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-r-md p-1.5 transition-colors ${
                viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      )}
      {error && <p className="py-8 text-center text-sm text-destructive">{error}</p>}
      {!loading && !error && accounts.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No accounts yet.{" "}
          <button
            onClick={openCreateModal}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </button>
        </p>
      )}
      {!loading && !error && accounts.length > 0 && (
        <div className="space-y-6">
          {viewMode === "grid" ? (
            <>
              <SectionGrid
                title="Assets"
                types={ASSET_TYPES}
                accounts={accounts}
                onViewType={viewTypeAccounts}
              />
              <SectionGrid
                title="Liabilities"
                types={LIABILITY_TYPES}
                accounts={accounts}
                onViewType={viewTypeAccounts}
              />
            </>
          ) : (
            <>
              <SectionList
                title="Assets"
                types={ASSET_TYPES}
                accounts={accounts}
                expanded={expanded}
                onToggle={toggleType}
              />
              <SectionList
                title="Liabilities"
                types={LIABILITY_TYPES}
                accounts={accounts}
                expanded={expanded}
                onToggle={toggleType}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
