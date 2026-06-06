import { useState, useEffect } from "react";
import { createTransaction } from "@/api/transactions";
import { fetchAccounts } from "@/api/accounts";
import { fetchCategories } from "@/api/categories";
import { useModal } from "@/context/ModalContext";
import { useDataRefresh } from "@/context/DataRefreshContext";
import type { AccountRead, CategoryRead, TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { cn, toLocalDatetime, getCurrencySymbol } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, ArrowLeftRight } from "lucide-react";
import QuickAccountModal from "./QuickAccountModal";
import QuickCategoryModal from "./QuickCategoryModal";

const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  income: ["income"],
  expense: ["expense"],
};

export default function TransactionFormModal() {
  const { closeTopModal, openModal } = useModal();
  const { signal } = useDataRefresh();
  const [accounts, setAccounts] = useState<AccountRead[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    txn_date: toLocalDatetime(new Date()).replace(" ", "T"),
    txn_type: "",
    amount: "",
    description: "",
    account_id: "",
    category_id: "",
    to_account_id: "",
  });

  const showCategory = form.txn_type && form.txn_type !== "transfer";

  const filteredCategories = (
    showCategory && form.txn_type
      ? categories.filter((c) =>
          CATEGORY_TYPE_MAP[form.txn_type]?.includes(c.type),
        )
      : categories
  ).filter((c) => c.name !== "Opening Balance");

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchAccounts(), fetchCategories()])
      .then(([accts, cats]) => {
        setAccounts(accts);
        setCategories(cats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.txn_type || !form.account_id || !form.amount) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.txn_type === "transfer" && !form.to_account_id) {
      setError("Please select a destination account");
      return;
    }
    if (form.txn_type !== "transfer" && !form.category_id) {
      setError("Please select a category");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      await createTransaction({
        txn_date: new Date(form.txn_date).toISOString(),
        txn_type: form.txn_type as TransactionType,
        amount: form.amount,
        description: form.description || null,
        account_id: form.account_id,
        category_id: form.txn_type === "transfer" ? null : form.category_id,
        to_account_id: form.txn_type === "transfer" ? form.to_account_id : null,
      });
      signal("transactions");
      closeTopModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transaction",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openQuickAccount = (field: "account_id" | "to_account_id") => {
    openModal(
      "quick-account",
      <QuickAccountModal
        onCreated={(account) => {
          setAccounts((prev) => [...prev, account]);
          setForm((prev) => ({ ...prev, [field]: account.id }));
        }}
      />,
    );
  };

  const openQuickCategory = () => {
    openModal(
      "quick-category",
      <QuickCategoryModal
        onCreated={(category) => {
          setCategories((prev) => [...prev, category]);
          setForm((prev) => ({ ...prev, category_id: category.id }));
        }}
      />,
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-1">New Transaction</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Record a new income or expense
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(["income", "expense", "transfer"] as const).map((type) => {
                const selected = form.txn_type === type;
                const isIncome = type === "income";
                const isExpense = type === "expense";
                const isTransfer = type === "transfer";
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const allowed = CATEGORY_TYPE_MAP[type] || [];
                      const currentCat = categories.find(
                        (c) => c.id === form.category_id,
                      );
                      const category_id =
                        currentCat && allowed.includes(currentCat.type)
                          ? form.category_id
                          : "";
                      setForm({
                        ...form,
                        txn_type: type,
                        category_id,
                        to_account_id: "",
                      });
                    }}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all",
                      selected
                        ? isIncome
                          ? "bg-[var(--color-income)] text-white"
                          : isExpense
                            ? "bg-[var(--color-expense)] text-white"
                            : "bg-primary text-primary-foreground"
                        : "border border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {isTransfer ? (
                      <span className="inline-flex items-center gap-1">
                        <ArrowLeftRight className="h-4 w-4" />
                        Transfer
                      </span>
                    ) : (
                      type.charAt(0).toUpperCase() + type.slice(1)
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-amount">Amount</Label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none pointer-events-none"
                style={{ fontSize: 24, lineHeight: 1 }}
              >
                {getCurrencySymbol()}
              </span>
              <Input
                id="modal-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className={cn(
                  "font-number h-14 pl-12 pr-3 text-right appearance-none",
                  form.txn_type === "income" && "text-[var(--color-income)]",
                  form.txn_type === "expense" && "text-[var(--color-expense)]",
                )}
                style={{ fontSize: 36, paddingTop: 8, paddingBottom: 8 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-date">Date & Time</Label>
            <Input
              id="modal-date"
              type="datetime-local"
              value={form.txn_date}
              onChange={(e) => setForm({ ...form, txn_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{form.txn_type === "transfer" ? "From Account" : "Account"}</Label>
              <Select
                value={form.account_id}
                onValueChange={(value) =>
                  setForm({ ...form, account_id: value })
                }
              >
                <SelectTrigger id="modal-account" className="w-full max-w-full">
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                    <SelectValue placeholder="Select account" />
                  </span>
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  style={{ maxHeight: "15rem" }}
                >
                  {accounts
                    .filter((a) => a.id !== form.to_account_id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => openQuickAccount("account_id")}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
              >
                <Plus className="h-3 w-3" />
                New Account
              </button>
            </div>
            {form.txn_type === "transfer" && (
              <div className="space-y-2">
                <Label>To Account</Label>
                <Select
                  value={form.to_account_id}
                  onValueChange={(value) =>
                    setForm({ ...form, to_account_id: value })
                  }
                >
                  <SelectTrigger id="modal-to-account" className="w-full max-w-full">
                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                      <SelectValue placeholder="Select account" />
                    </span>
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    style={{ maxHeight: "15rem" }}
                  >
                    {accounts
                      .filter((a) => a.id !== form.account_id)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => openQuickAccount("to_account_id")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <Plus className="h-3 w-3" />
                  New Account
                </button>
              </div>
            )}
            {showCategory && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(value) =>
                    setForm({ ...form, category_id: value })
                  }
                >
                  <SelectTrigger
                    id="modal-category"
                    className="w-full max-w-full"
                  >
                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                      <SelectValue placeholder="Select category" />
                    </span>
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="min-w-[220px]"
                    style={{ maxHeight: "15rem" }}
                  >
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ${c.name}` : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={openQuickCategory}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <Plus className="h-3 w-3" />
                  New Category
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-description">Description</Label>
            <Input
              id="modal-description"
              placeholder="Optional note"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeTopModal}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create Transaction"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
