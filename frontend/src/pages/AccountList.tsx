import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchAccounts } from "@/api/accounts";
import type { AccountRead, AccountType } from "@/types";
import { Button } from "@/components/ui/button";
import { useModal } from "@/context/ModalContext";
import QuickAccountModal from "@/components/QuickAccountModal";
import { fmt } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Landmark,
  Building2,
  PiggyBank,
  Handshake,
  Banknote,
  Loader2,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  bank: <Landmark className="h-5 w-5" />,
  investment: <PiggyBank className="h-5 w-5" />,
  receivables: <Handshake className="h-5 w-5" />,
  payables: <Building2 className="h-5 w-5" />,
};

const ACCOUNT_COLORS: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  bank: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  investment:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  receivables:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  payables: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
};

interface TypeGroup {
  type: AccountType;
  label: string;
}

const ASSET_GROUPS: TypeGroup[] = [
  { type: "cash", label: "Cash" },
  { type: "bank", label: "Bank" },
  { type: "investment", label: "Investments" },
  { type: "receivables", label: "Receivables" },
];

const LIABILITY_GROUPS: TypeGroup[] = [{ type: "payables", label: "Payables" }];

function TypeSection({
  title,
  titleColor,
  groups,
  accounts,
  collapsed,
  onToggle,
}: {
  title: string;
  titleColor: string;
  groups: TypeGroup[];
  accounts: AccountRead[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const sectionTotal = groups.reduce(
    (sum, g) =>
      sum +
      accounts
        .filter((a) => a.type === g.type)
        .reduce((s, a) => s + parseFloat(a.current_balance), 0),
    0,
  );

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-muted/50 ${titleColor}`}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {title}
        <span className="ml-auto font-number text-xs font-normal normal-case">
          {fmt(sectionTotal)}
        </span>
      </button>

      {!collapsed &&
        groups.map((g) => (
          <TypeGroupBlock
            key={g.type}
            group={g}
            accounts={accounts.filter((a) => a.type === g.type)}
          />
        ))}
    </div>
  );
}

function TypeGroupBlock({
  group,
  accounts,
}: {
  group: TypeGroup;
  accounts: AccountRead[];
}) {
  const [open, setOpen] = useState(true);
  const groupTotal = accounts.reduce(
    (s, a) => s + parseFloat(a.current_balance),
    0,
  );

  return (
    <div className="ml-2 space-y-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
      >
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full ${ACCOUNT_COLORS[group.type] || ACCOUNT_COLORS.bank}`}
        >
          {ACCOUNT_ICONS[group.type] || ACCOUNT_ICONS.bank}
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span>{group.label}</span>
        <span className="ml-auto font-number text-sm tabular-nums text-foreground">
          {fmt(groupTotal)}
        </span>
      </button>

      {open &&
        accounts.map((a) => (
          <Link
            key={a.id}
            to={`/accounts/${a.id}`}
            className="ml-[74px] flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted/30"
          >
            <span>{a.name}</span>
            <span className="font-number text-sm tabular-nums text-foreground">
              {fmt(a.current_balance)}
            </span>
          </Link>
        ))}

      {open && accounts.length === 0 && (
        <p className="ml-[74px] py-1.5 text-xs text-muted-foreground">
          No {group.label.toLowerCase()} accounts yet.
        </p>
      )}
    </div>
  );
}

export default function AccountList() {
  const { openModal } = useModal();
  const [accounts, setAccounts] = useState<AccountRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assetsOpen, setAssetsOpen] = useState(true);
  const [liabilitiesOpen, setLiabilitiesOpen] = useState(true);

  const loadAccounts = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAccounts()
      .then((data) => setAccounts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  const netAssets = ASSET_GROUPS.reduce(
    (sum, g) =>
      sum +
      accounts
        .filter((a) => a.type === g.type)
        .reduce((s, a) => s + parseFloat(a.current_balance), 0),
    0,
  );

  const netLiabilities = LIABILITY_GROUPS.reduce(
    (sum, g) =>
      sum +
      accounts
        .filter((a) => a.type === g.type)
        .reduce((s, a) => s + parseFloat(a.current_balance), 0),
    0,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle>Accounts</CardTitle>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
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
            <button
              onClick={openCreateModal}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create one
            </button>
          </p>
        )}
        {!loading && !error && accounts.length > 0 && (
          <div className="space-y-4">
            <TypeSection
              title="ASSETS"
              titleColor="text-[var(--color-income)]"
              groups={ASSET_GROUPS}
              accounts={accounts}
              collapsed={!assetsOpen}
              onToggle={() => setAssetsOpen((v) => !v)}
            />
            <TypeSection
              title="LIABILITIES"
              titleColor="text-[var(--color-expense)]"
              groups={LIABILITY_GROUPS}
              accounts={accounts}
              collapsed={!liabilitiesOpen}
              onToggle={() => setLiabilitiesOpen((v) => !v)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
