import type { AccountRead } from "../types"
import { apiFetch } from "./client"

export async function fetchAccounts(): Promise<AccountRead[]> {
  return apiFetch<AccountRead[]>("/accounts/")
}
