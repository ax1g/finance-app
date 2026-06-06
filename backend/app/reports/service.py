import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from app.reports.repository import ReportRepo
from app.core.enums import TransactionType
from app.reports.schema import (
    DashboardResponse,
    RecentTransaction,
    CategorySpending,
    BalanceByType,
    NetWorthHistoryItem,
    SpendingByCategoryItem,
    MonthlySummaryItem,
    AccountSummaryItem,
    IncomeStatementResponse,
    IncomeStatementItem,
)


class ReportService:
    def __init__(self, repo: ReportRepo):
        self.repo = repo

    async def get_dashboard(self, user_id: uuid.UUID) -> DashboardResponse:
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_assets = await self.repo.get_total_assets(user_id)
        total_liabilities = await self.repo.get_total_liabilities(user_id)
        total_balance = total_assets - total_liabilities
        income = await self.repo.get_period_income(user_id, start_of_month, now)
        expenses = await self.repo.get_period_expenses(user_id, start_of_month, now)

        balance_by_type_data = await self.repo.get_balance_by_type(user_id)
        balance_by_type = [
            BalanceByType(account_type=row["account_type"], balance=row["balance"])
            for row in balance_by_type_data
        ]

        since_5y = now - timedelta(days=1825)
        monthly_net_data = await self.repo.get_monthly_summary(user_id, since_5y)
        adj_data = await self.repo.get_adjustments_by_month(user_id, since_5y)
        adj_by_month = {r["year_month"]: r["total"] for r in adj_data}

        running = total_balance
        history: list[NetWorthHistoryItem] = []
        for row in reversed(monthly_net_data):
            adj = adj_by_month.get(row["year_month"], Decimal("0"))
            net_change = row["income"] - row["expense"] + adj
            history.append(NetWorthHistoryItem(date=row["year_month"], net_worth=running))
            running -= net_change
        history.reverse()

        top_categories_data = await self.repo.get_top_spending_categories(
            user_id, start_of_month, now
        )
        total_expenses = expenses or Decimal("0.01")
        top_categories = [
            CategorySpending(
                category_id=row["category_id"],
                category_name=row["category_name"],
                icon=row["icon"],
                total=row["total"],
                percentage=float(row["total"] / total_expenses * 100),
                transaction_count=row["transaction_count"],
            )
            for row in top_categories_data
        ]

        transactions = await self.repo.get_recent_transactions(user_id)
        recent = [
            RecentTransaction(
                id=t.id,
                txn_date=t.txn_date,
                txn_type=t.txn_type,
                amount=t.amount,
                description=t.description,
                category_name=t.category.name if t.category else None,
                account_name=t.account.name if t.account else "",
                to_account_name=t.to_account.name if t.to_account else None,
            )
            for t in transactions
        ]

        return DashboardResponse(
            total_balance=total_balance,
            total_assets=total_assets,
            total_liabilities=total_liabilities,
            balance_by_type=balance_by_type,
            networth_history=history,
            current_month_income=income,
            current_month_expenses=expenses,
            current_month_net=income - expenses,
            top_spending_categories=top_categories,
            recent_transactions=recent,
        )

    async def get_spending_by_category(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> list[SpendingByCategoryItem]:
        rows = await self.repo.get_spending_by_category(user_id, start, end)
        total = sum(row["total"] for row in rows) or Decimal("0.01")
        return [
            SpendingByCategoryItem(
                category_id=row["category_id"],
                category_name=row["category_name"],
                icon=row["icon"],
                total=row["total"],
                percentage=float(row["total"] / total * 100),
                transaction_count=row["transaction_count"],
            )
            for row in rows
        ]

    async def get_income_by_category(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> list[SpendingByCategoryItem]:
        rows = await self.repo.get_income_by_category(user_id, start, end)
        total = sum(row["total"] for row in rows) or Decimal("0.01")
        return [
            SpendingByCategoryItem(
                category_id=row["category_id"],
                category_name=row["category_name"],
                icon=row["icon"],
                total=row["total"],
                percentage=float(row["total"] / total * 100),
                transaction_count=row["transaction_count"],
            )
            for row in rows
        ]

    async def get_monthly_summary(
        self, user_id: uuid.UUID, months: int = 12
    ) -> list[MonthlySummaryItem]:
        since = datetime.now(timezone.utc) - timedelta(days=30 * months)
        rows = await self.repo.get_monthly_summary(user_id, since)
        return [
            MonthlySummaryItem(
                year_month=row["year_month"],
                income=row["income"],
                expense=row["expense"],
                net=row["income"] - row["expense"],
            )
            for row in rows
        ]

    async def get_account_summary(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> list[AccountSummaryItem]:
        rows = await self.repo.get_account_summary(user_id, start, end)
        return [
            AccountSummaryItem(
                account_id=row["account_id"],
                account_name=row["account_name"],
                account_type=row["account_type"],
                balance=row["balance"],
                income_this_month=row["income_this_month"],
                expenses_this_month=row["expenses_this_month"],
            )
            for row in rows
        ]

    async def get_income_statement(
        self, user_id: uuid.UUID, year: int, month: int
    ) -> IncomeStatementResponse:
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc) - timedelta(seconds=1)
        else:
            end = datetime(year, month + 1, 1, tzinfo=timezone.utc) - timedelta(seconds=1)

        closing_balance = await self.repo.get_total_balance(user_id, as_of=end)
        total_income = await self.repo.get_period_income(user_id, start, end)
        total_expenses = await self.repo.get_period_expenses(user_id, start, end)
        opening_balance = closing_balance - total_income + total_expenses

        transactions = await self.repo.get_period_transactions(user_id, start, end)

        income_txns: list[IncomeStatementItem] = []
        expense_txns: list[IncomeStatementItem] = []
        for t in transactions:
            item = IncomeStatementItem(
                txn_date=t.txn_date,
                txn_type=t.txn_type,
                description=t.description,
                amount=t.amount,
                category_name=t.category.name if t.category else None,
                account_name=t.account.name if t.account else "",
                to_account_name=t.to_account.name if t.to_account else None,
            )
            if t.txn_type == TransactionType.INCOME:
                income_txns.append(item)
            elif t.txn_type == TransactionType.EXPENSE:
                expense_txns.append(item)

        return IncomeStatementResponse(
            opening_balance=opening_balance,
            closing_balance=closing_balance,
            total_income=total_income,
            total_expenses=total_expenses,
            net=total_income - total_expenses,
            income_transactions=income_txns,
            expense_transactions=expense_txns,
        )
