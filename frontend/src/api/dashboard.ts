export interface DashboardData {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  totalIncome: number
  totalExpense: number
}

const MOCK_DATA: Record<string, DashboardData> = {
  week: {
    netWorth: 45280.50,
    totalAssets: 48600.00,
    totalLiabilities: 3319.50,
    totalIncome: 3200.00,
    totalExpense: 1845.75,
  },
  month: {
    netWorth: 45280.50,
    totalAssets: 48600.00,
    totalLiabilities: 3319.50,
    totalIncome: 12450.00,
    totalExpense: 8720.30,
  },
  year: {
    netWorth: 45280.50,
    totalAssets: 48600.00,
    totalLiabilities: 3319.50,
    totalIncome: 89200.00,
    totalExpense: 65140.80,
  },
  all: {
    netWorth: 45280.50,
    totalAssets: 48600.00,
    totalLiabilities: 3319.50,
    totalIncome: 184300.00,
    totalExpense: 139019.50,
  },
}

export async function fetchDashboardData(
  period: "week" | "month" | "year" | "all" = "month",
): Promise<DashboardData> {
  return MOCK_DATA[period]
}
