import type {
  TransactionRead,
  TransactionSummary,
  CursorPage,
  TransactionCreate,
  TransactionUpdate,
} from "../types";
import { apiFetch } from "./client";

export interface TransactionFilters {
  txn_type?: string;
  limit?: number;
  cursor?: string;
  start?: string;
  end?: string;
}

export async function fetchTransactions(
  filters: TransactionFilters = {},
): Promise<CursorPage<TransactionSummary>> {
  const params = new URLSearchParams();
  if (filters.txn_type) params.set("txn_type", filters.txn_type);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.start) params.set("start", toDateTime(filters.start, "start"));
  if (filters.end) params.set("end", toDateTime(filters.end, "end"));

  const qs = params.toString();
  return apiFetch<CursorPage<TransactionSummary>>(`/transactions/${qs ? `?${qs}` : ""}`);
}

function toDateTime(value: string, boundary: "start" | "end"): string {
  if (value.includes("T")) return value;
  return `${value}T${boundary === "start" ? "00:00:00" : "23:59:59"}`;
}

export async function fetchTransaction(id: string): Promise<TransactionRead> {
  return apiFetch<TransactionRead>(`/transactions/${id}`);
}

export async function createTransaction(
  data: TransactionCreate,
): Promise<TransactionRead> {
  return apiFetch<TransactionRead>("/transactions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(
  id: string,
  data: TransactionUpdate,
): Promise<TransactionRead> {
  return apiFetch<TransactionRead>(`/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiFetch<void>(`/transactions/${id}`, { method: "DELETE" });
}
