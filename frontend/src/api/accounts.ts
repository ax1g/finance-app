import type { AccountRead, AccountCreate, AccountUpdate } from "../types"
import { apiFetch } from "./client"

export async function fetchAccounts(): Promise<AccountRead[]> {
  return apiFetch<AccountRead[]>("/accounts/")
}

export async function fetchAccount(id: string): Promise<AccountRead> {
  return apiFetch<AccountRead>(`/accounts/${id}`)
}

export async function createAccount(data: AccountCreate): Promise<AccountRead> {
  return apiFetch<AccountRead>("/accounts/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateAccount(
  id: string,
  data: AccountUpdate,
): Promise<AccountRead> {
  return apiFetch<AccountRead>(`/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteAccount(id: string): Promise<void> {
  await apiFetch<void>(`/accounts/${id}`, { method: "DELETE" })
}
