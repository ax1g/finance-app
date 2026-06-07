"""add composite index (user_id, txn_type, txn_date) on transactions

Revision ID: 4e8f6a2b9c1d
Revises: 39a7b2c8d1e4
Create Date: 2026-06-07 11:00:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "4e8f6a2b9c1d"
down_revision: Union[str, Sequence[str], None] = "39a7b2c8d1e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_transactions_user_type_date",
        "transactions",
        ["user_id", "txn_type", "txn_date"],
        unique=False,
        postgresql_using="btree",
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_type_date", table_name="transactions")
