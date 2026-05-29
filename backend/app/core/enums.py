from enum import StrEnum


class TransactionType(StrEnum):
    INCOME = "income"
    EXPENSE = "expense"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"


class AccountType(StrEnum):
    CASH = "cash"
    BANK = "bank"
    INVESTMENT = "investment"
    RECEIVABLES = "receivables"
    PAYABLES = "payables"


class CategoryType(StrEnum):
    INCOME = "income"
    EXPENSE = "expense"


class CategoryStatus(StrEnum):
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"


class AccountStatus(StrEnum):
    ACTIVE = "active"
    CLOSED = "closed"
    SUSPENDED = "suspended"
