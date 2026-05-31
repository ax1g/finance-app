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
  category_id: string
  category: CategoryRead
}

export interface TransactionCreate {
  txn_date: string
  txn_type: TransactionType
  amount: string
  description: string | null
  account_id: string
  category_id: string
}

export interface TransactionUpdate {
  txn_date?: string
  txn_type?: TransactionType
  amount?: string
  description?: string | null
  account_id?: string
  category_id?: string
}

export const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "adjustment", "transfer"]
export const ACCOUNT_TYPES: AccountType[] = ["cash", "bank", "investment", "receivables", "payables"]
export const CATEGORY_TYPES: CategoryType[] = ["income", "expense"]

export interface AuthTokens {
  access_token: string
  token_type: string
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
}
