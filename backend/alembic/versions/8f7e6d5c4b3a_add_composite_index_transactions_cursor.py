"""add composite index (user_id, txn_type, txn_date, created_at, id) for cursor pagination

Revision ID: 8f7e6d5c4b3a
Revises: 4e8f6a2b9c1d
Create Date: 2026-06-08 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "8f7e6d5c4b3a"
down_revision: Union[str, Sequence[str], None] = "4e8f6a2b9c1d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_transactions_user_type_date_created_id",
        "transactions",
        ["user_id", "txn_type", "txn_date", "created_at", "id"],
        unique=False,
        postgresql_using="btree",
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_type_date_created_id", table_name="transactions")