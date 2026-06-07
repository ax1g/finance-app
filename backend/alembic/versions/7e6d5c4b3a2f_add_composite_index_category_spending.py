"""add composite indexes for category spending reports

Revision ID: 7e6d5c4b3a2f
Revises: 8f7e6d5c4b3a
Create Date: 2026-06-08 12:05:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "7e6d5c4b3a2f"
down_revision: Union[str, Sequence[str], None] = "8f7e6d5c4b3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # For get_top_spending_categories and get_spending_by_category
    op.create_index(
        "ix_transactions_user_expense_date_cat",
        "transactions",
        ["user_id", "txn_type", "txn_date", "category_id"],
        unique=False,
        postgresql_using="btree",
        postgresql_where="txn_type = 'EXPENSE'",
    )
    # For get_income_by_category
    op.create_index(
        "ix_transactions_user_income_date_cat",
        "transactions",
        ["user_id", "txn_type", "txn_date", "category_id"],
        unique=False,
        postgresql_using="btree",
        postgresql_where="txn_type = 'INCOME'",
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_expense_date_cat", table_name="transactions")
    op.drop_index("ix_transactions_user_income_date_cat", table_name="transactions")