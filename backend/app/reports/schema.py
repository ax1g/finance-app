import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.core.enums import TransactionType, AccountType


class RecentTransaction(BaseModel):
    id: uuid.UUID
    txn_date: datetime
    txn_type: TransactionType
    amount: Decimal
    description: str | None
    category_name: str | None
    account_name: str
    to_account_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CategorySpending(BaseModel):
    category_id: uuid.UUID
    category_name: str
    icon: str | None
    total: Decimal
    percentage: float
    transaction_count: int


class BalanceByType(BaseModel):
    account_type: AccountType
    balance: Decimal


class NetWorthHistoryItem(BaseModel):
    date: str
    net_worth: Decimal


class DashboardResponse(BaseModel):
    total_balance: Decimal
    total_assets: Decimal
    total_liabilities: Decimal
    balance_by_type: list[BalanceByType]
    networth_history: list[NetWorthHistoryItem]
    current_month_income: Decimal
    current_month_expenses: Decimal
    current_month_net: Decimal
    top_spending_categories: list[CategorySpending]
    recent_transactions: list[RecentTransaction]


class SpendingByCategoryItem(BaseModel):
    category_id: uuid.UUID
    category_name: str
    icon: str | None
    total: Decimal
    percentage: float
    transaction_count: int


class MonthlySummaryItem(BaseModel):
    year_month: str
    income: Decimal
    expense: Decimal
    net: Decimal


class AccountSummaryItem(BaseModel):
    account_id: uuid.UUID
    account_name: str
    account_type: AccountType
    balance: Decimal
    balance_as_of_end: Decimal
    income_this_month: Decimal
    expenses_this_month: Decimal


class IncomeStatementItem(BaseModel):
    txn_date: datetime
    txn_type: TransactionType
    description: str | None
    amount: Decimal
    category_name: str | None
    account_name: str
    to_account_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class IncomeStatementResponse(BaseModel):
    opening_balance: Decimal
    closing_balance: Decimal
    total_income: Decimal
    total_expenses: Decimal
    total_adjustments: Decimal
    net: Decimal
    income_transactions: list[IncomeStatementItem]
    expense_transactions: list[IncomeStatementItem]
    adjustment_transactions: list[IncomeStatementItem]
