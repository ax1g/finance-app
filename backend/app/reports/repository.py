import uuid
from datetime import datetime
from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import select, func, desc, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from app.core.exceptions import RepositoryError
from app.transactions.model import Transaction
from app.accounts.model import Account
from app.categories.model import Category
from app.core.enums import CategoryType, TransactionType, AccountType, AccountStatus


class ReportRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_total_balance(
        self, user_id: uuid.UUID, as_of: datetime | None = None
    ) -> Decimal:
        try:
            query = select(func.coalesce(func.sum(Account.current_balance), 0)).where(
                Account.user_id == user_id,
                Account.status == AccountStatus.ACTIVE,
            )
            if as_of is not None:
                query = query.where(Account.created_at <= as_of)
            result = await self.db.execute(query)
            return result.scalar()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_account_overview(
        self, user_id: uuid.UUID
    ) -> tuple[Decimal, Decimal, Sequence[dict]]:
        try:
            query = (
                select(
                    Account.type.label("account_type"),
                    func.coalesce(func.sum(Account.current_balance), 0).label(
                        "balance"
                    ),
                )
                .where(
                    Account.user_id == user_id,
                    Account.status == AccountStatus.ACTIVE,
                )
                .group_by(Account.type)
            )
            result = await self.db.execute(query)
            rows = result.mappings().all()
            asset_types = {
                AccountType.CASH,
                AccountType.BANK,
                AccountType.INVESTMENT,
                AccountType.RECEIVABLES,
            }
            total_assets = Decimal("0")
            total_liabilities = Decimal("0")
            for row in rows:
                if row["account_type"] in asset_types:
                    total_assets += row["balance"]
                elif row["account_type"] == AccountType.PAYABLES:
                    total_liabilities += row["balance"]
            return total_assets, total_liabilities, rows
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_period_income_expenses(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> tuple[Decimal, Decimal]:
        try:
            query = select(
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Transaction.txn_type == TransactionType.INCOME,
                                Transaction.amount,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("income"),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Transaction.txn_type == TransactionType.EXPENSE,
                                Transaction.amount,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("expenses"),
            ).where(
                Transaction.user_id == user_id,
                Transaction.txn_date >= start,
                Transaction.txn_date <= end,
            )
            result = await self.db.execute(query)
            row = result.mappings().one()
            return row["income"], row["expenses"]
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_period_income_expenses_adjustments(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> tuple[Decimal, Decimal, Decimal]:
        try:
            query = select(
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Transaction.txn_type == TransactionType.INCOME,
                                Transaction.amount,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("income"),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Transaction.txn_type == TransactionType.EXPENSE,
                                Transaction.amount,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("expenses"),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Transaction.txn_type == TransactionType.ADJUSTMENT,
                                Transaction.amount,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ).label("adjustments"),
            ).where(
                Transaction.user_id == user_id,
                Transaction.txn_date >= start,
                Transaction.txn_date <= end,
            )
            result = await self.db.execute(query)
            row = result.mappings().one()
            return row["income"], row["expenses"], row["adjustments"]
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_top_spending_categories(
        self, user_id: uuid.UUID, start: datetime, end: datetime, limit: int = 5
    ) -> Sequence[dict]:
        try:
            query = (
                select(
                    Category.id.label("category_id"),
                    Category.name.label("category_name"),
                    Category.icon,
                    func.coalesce(func.sum(Transaction.amount), 0).label("total"),
                    func.count(Transaction.id).label("transaction_count"),
                )
                .join(Transaction, Transaction.category_id == Category.id)
                .where(
                    Transaction.user_id == user_id,
                    Transaction.txn_type == TransactionType.EXPENSE,
                    Category.type == CategoryType.EXPENSE,
                    Transaction.txn_date >= start,
                    Transaction.txn_date <= end,
                )
                .group_by(Category.id, Category.name, Category.icon)
                .order_by(desc("total"))
                .limit(limit)
            )
            result = await self.db.execute(query)
            return result.mappings().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_recent_transactions(
        self, user_id: uuid.UUID, limit: int = 5
    ) -> Sequence[Transaction]:
        try:
            query = (
                select(Transaction)
                .options(
                    selectinload(Transaction.category),
                    selectinload(Transaction.account),
                    selectinload(Transaction.to_account),
                )
                .where(Transaction.user_id == user_id)
                .order_by(desc(Transaction.txn_date))
                .limit(limit)
            )
            result = await self.db.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_period_transactions(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> Sequence[Transaction]:
        try:
            query = (
                select(Transaction)
                .options(
                    selectinload(Transaction.category),
                    selectinload(Transaction.account),
                    selectinload(Transaction.to_account),
                )
                .where(
                    Transaction.user_id == user_id,
                    Transaction.txn_date >= start,
                    Transaction.txn_date <= end,
                )
                .order_by(Transaction.txn_date)
            )
            result = await self.db.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_spending_by_category(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> Sequence[dict]:
        try:
            query = (
                select(
                    Category.id.label("category_id"),
                    Category.name.label("category_name"),
                    Category.icon,
                    func.coalesce(func.sum(Transaction.amount), 0).label("total"),
                    func.count(Transaction.id).label("transaction_count"),
                )
                .join(Transaction, Transaction.category_id == Category.id)
                .where(
                    Transaction.user_id == user_id,
                    Transaction.txn_type == TransactionType.EXPENSE,
                    Category.type == CategoryType.EXPENSE,
                    Transaction.txn_date >= start,
                    Transaction.txn_date <= end,
                )
                .group_by(Category.id, Category.name, Category.icon)
                .order_by(desc("total"))
            )
            result = await self.db.execute(query)
            return result.mappings().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_income_by_category(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> Sequence[dict]:
        try:
            query = (
                select(
                    Category.id.label("category_id"),
                    Category.name.label("category_name"),
                    Category.icon,
                    func.coalesce(func.sum(Transaction.amount), 0).label("total"),
                    func.count(Transaction.id).label("transaction_count"),
                )
                .join(Transaction, Transaction.category_id == Category.id)
                .where(
                    Transaction.user_id == user_id,
                    Transaction.txn_type == TransactionType.INCOME,
                    Category.type == CategoryType.INCOME,
                    Transaction.txn_date >= start,
                    Transaction.txn_date <= end,
                )
                .group_by(Category.id, Category.name, Category.icon)
                .order_by(desc("total"))
            )
            result = await self.db.execute(query)
            return result.mappings().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_monthly_summary(
        self, user_id: uuid.UUID, since: datetime
    ) -> Sequence[dict]:
        try:
            query = (
                select(
                    func.to_char(Transaction.txn_date, "YYYY-MM").label("year_month"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.INCOME,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("income"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.EXPENSE,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("expense"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.ADJUSTMENT,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("adjustment"),
                )
                .where(
                    Transaction.user_id == user_id,
                    Transaction.txn_date >= since,
                )
                .group_by("year_month")
                .order_by(desc("year_month"))
            )
            result = await self.db.execute(query)
            return result.mappings().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_account_summary(
        self, user_id: uuid.UUID, start: datetime, end: datetime
    ) -> Sequence[dict]:
        try:
            query = (
                select(
                    Account.id.label("account_id"),
                    Account.name.label("account_name"),
                    Account.type.label("account_type"),
                    Account.current_balance.label("balance"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.INCOME,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("income_this_month"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.EXPENSE,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("expenses_this_month"),
                )
                .outerjoin(
                    Transaction,
                    (Transaction.account_id == Account.id)
                    & (Transaction.txn_date >= start)
                    & (Transaction.txn_date <= end),
                )
                .where(
                    Account.user_id == user_id,
                    Account.status == AccountStatus.ACTIVE,
                )
                .group_by(
                    Account.id, Account.name, Account.type, Account.current_balance
                )
                .order_by(Account.name)
            )
            result = await self.db.execute(query)
            return result.mappings().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_account_post_period_totals(
        self, user_id: uuid.UUID, end: datetime
    ) -> Sequence[dict]:
        try:
            query = (
                select(
                    Transaction.account_id,
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.INCOME,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("income"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.EXPENSE,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("expenses"),
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    Transaction.txn_type == TransactionType.ADJUSTMENT,
                                    Transaction.amount,
                                ),
                                else_=0,
                            )
                        ),
                        0,
                    ).label("adjustments"),
                )
                .where(
                    Transaction.user_id == user_id,
                    Transaction.txn_date > end,
                )
                .group_by(Transaction.account_id)
            )
            result = await self.db.execute(query)
            return result.mappings().all()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e
