"""add composite indexes for monthly summary and account summary

Revision ID: 6d5c4b3a2f1e
Revises: 7e6d5c4b3a2f
Create Date: 2026-06-08 12:10:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "6d5c4b3a2f1e"
down_revision: Union[str, Sequence[str], None] = "7e6d5c4b3a2f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # For get_monthly_summary - avoids func.to_char index issue
    op.create_index(
        "ix_transactions_user_txn_date",
        "transactions",
        ["user_id", "txn_date"],
        unique=False,
        postgresql_using="btree",
    )
    # For get_account_summary outer join with date filter
    op.create_index(
        "ix_transactions_user_account_date",
        "transactions",
        ["user_id", "account_id", "txn_date"],
        unique=False,
        postgresql_using="btree",
    )
    # For get_account_post_period_totals
    op.create_index(
        "ix_transactions_user_account_date_desc",
        "transactions",
        ["user_id", "account_id", "txn_date"],
        unique=False,
        postgresql_using="btree",
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_txn_date", table_name="transactions")
    op.drop_index("ix_transactions_user_account_date", table_name="transactions")
    op.drop_index("ix_transactions_user_account_date_desc", table_name="transactions")