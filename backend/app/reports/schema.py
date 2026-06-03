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
    category_name: str
    account_name: str

    model_config = ConfigDict(from_attributes=True)


class CategorySpending(BaseModel):
    category_id: uuid.UUID
    category_name: str
    icon: str | None
    total: Decimal
    percentage: float
    transaction_count: int


class DashboardResponse(BaseModel):
    total_balance: Decimal
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
    income_this_month: Decimal
    expenses_this_month: Decimal


class IncomeStatementItem(BaseModel):
    txn_date: datetime
    txn_type: TransactionType
    description: str | None
    amount: Decimal
    category_name: str
    account_name: str

    model_config = ConfigDict(from_attributes=True)


class IncomeStatementResponse(BaseModel):
    opening_balance: Decimal
    closing_balance: Decimal
    total_income: Decimal
    total_expenses: Decimal
    net: Decimal
    income_transactions: list[IncomeStatementItem]
    expense_transactions: list[IncomeStatementItem]
