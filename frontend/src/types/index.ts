export interface AccountRead {
  id: string
  name: string
  type: AccountType
  current_balance: string
}

export interface AccountCreate {
  name: string
  type: AccountType
  opening_balance: string
}

export interface AccountUpdate {
  name?: string
  type?: AccountType
}

export interface CategoryRead {
  id: string
  name: string
  type: CategoryType
  description: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
}

export interface CategoryCreate {
  name: string
  type: CategoryType
  description?: string | null
  icon?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface CategoryUpdate {
  name?: string
  type?: CategoryType
  description?: string | null
  icon?: string | null
  is_active?: boolean
  sort_order?: number
}

export type TransactionType = "income" | "expense" | "adjustment" | "transfer"

export type AccountType = "cash" | "bank" | "investment" | "receivables" | "payables"

export type CategoryType = "income" | "expense"

export interface TransactionRead {
  id: string
  txn_date: string
  txn_type: TransactionType
  amount: string
  description: string | null
  account_id: string
  account: AccountRead
  category_id: string | null
  category: CategoryRead | null
  to_account_id: string | null
  to_account: AccountRead | null
}

export interface TransactionCreate {
  txn_date: string
  txn_type: TransactionType
  amount: string
  description: string | null
  account_id: string
  category_id?: string | null
  to_account_id?: string | null
}

export interface TransactionUpdate {
  txn_date?: string
  txn_type?: TransactionType
  amount?: string
  description?: string | null
  account_id?: string
  category_id?: string | null
  to_account_id?: string | null
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface ForgotPasswordResponse {
  message: string
  reset_token: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SignupRequest {
  username: string
  email: string
  password: string
}

export interface UserRead {
  id: string
  username: string
  email: string
  currency: string
  currency_custom_symbol: string | null
}

export interface UserUpdate {
  username?: string
  email?: string
  currency?: string
  currency_custom_symbol?: string | null
}

export interface RecentTransaction {
  id: string
  txn_date: string
  txn_type: TransactionType
  amount: string
  description: string | null
  category_name: string
  account_name: string
  to_account_name: string | null
}

export interface CategorySpending {
  category_id: string
  category_name: string
  icon: string | null
  total: string
  percentage: number
  transaction_count: number
}

export interface DashboardResponse {
  total_balance: string
  current_month_income: string
  current_month_expenses: string
  current_month_net: string
  top_spending_categories: CategorySpending[]
  recent_transactions: RecentTransaction[]
}

export interface SpendingByCategoryItem {
  category_id: string
  category_name: string
  icon: string | null
  total: string
  percentage: number
  transaction_count: number
}

export interface MonthlySummaryItem {
  year_month: string
  income: string
  expense: string
  net: string
}

export interface AccountSummaryItem {
  account_id: string
  account_name: string
  account_type: AccountType
  balance: string
  income_this_month: string
  expenses_this_month: string
}

export interface IncomeStatementItem {
  txn_date: string
  txn_type: TransactionType
  description: string | null
  amount: string
  category_name: string
  account_name: string
}

export interface IncomeStatementResponse {
  opening_balance: string
  closing_balance: string
  total_income: string
  total_expenses: string
  net: string
  income_transactions: IncomeStatementItem[]
  expense_transactions: IncomeStatementItem[]
}
