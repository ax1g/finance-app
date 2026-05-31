import type {
  TransactionRead,
  TransactionCreate,
  TransactionUpdate,
} from "../types"
import { apiFetch } from "./client"

export interface TransactionFilters {
  txn_type?: string
  limit?: number
  offset?: number
  start?: string
  end?: string
}

export async function fetchTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionRead[]> {
  const params = new URLSearchParams()
  if (filters.txn_type) params.set("txn_type", filters.txn_type)
  if (filters.limit) params.set("limit", String(filters.limit))
  if (filters.offset) params.set("offset", String(filters.offset))
  if (filters.start) params.set("start", filters.start)
  if (filters.end) params.set("end", filters.end)

  const qs = params.toString()
  return apiFetch<TransactionRead[]>(`/transactions/${qs ? `?${qs}` : ""}`)
}

export async function fetchTransaction(
  id: string,
): Promise<TransactionRead> {
  return apiFetch<TransactionRead>(`/transactions/${id}`)
}

export async function createTransaction(
  data: TransactionCreate,
): Promise<TransactionRead> {
  return apiFetch<TransactionRead>("/transactions/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateTransaction(
  id: string,
  data: TransactionUpdate,
): Promise<TransactionRead> {
  return apiFetch<TransactionRead>(`/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiFetch<void>(`/transactions/${id}`, { method: "DELETE" })
}
