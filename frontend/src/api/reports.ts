import type {
  DashboardResponse,
  SpendingByCategoryItem,
  MonthlySummaryItem,
  AccountSummaryItem,
  IncomeStatementResponse,
} from "../types"
import { apiFetch } from "./client"

export async function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/reports/dashboard")
}

export async function fetchIncomeByCategory(
  start?: string,
  end?: string,
): Promise<SpendingByCategoryItem[]> {
  const params = new URLSearchParams()
  if (start) params.set("start_date", start)
  if (end) params.set("end_date", end)

  const qs = params.toString()
  return apiFetch<SpendingByCategoryItem[]>(
    `/reports/income-by-category${qs ? `?${qs}` : ""}`,
  )
}

export async function fetchSpendingByCategory(
  start?: string,
  end?: string,
): Promise<SpendingByCategoryItem[]> {
  const params = new URLSearchParams()
  if (start) params.set("start_date", start)
  if (end) params.set("end_date", end)

  const qs = params.toString()
  return apiFetch<SpendingByCategoryItem[]>(
    `/reports/spending-by-category${qs ? `?${qs}` : ""}`,
  )
}

export async function fetchMonthlySummary(
  months: number = 12,
): Promise<MonthlySummaryItem[]> {
  return apiFetch<MonthlySummaryItem[]>(
    `/reports/monthly-summary?months=${months}`,
  )
}

export async function fetchAccountSummary(): Promise<AccountSummaryItem[]> {
  return apiFetch<AccountSummaryItem[]>("/reports/account-summary")
}

export async function fetchIncomeStatement(
  year: number,
  month: number,
): Promise<IncomeStatementResponse> {
  return apiFetch<IncomeStatementResponse>(
    `/reports/income-statement?year=${year}&month=${month}`,
  )
}
