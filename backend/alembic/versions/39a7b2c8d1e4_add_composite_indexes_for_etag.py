"""add composite indexes (user_id, updated_at) for ETag queries

Revision ID: 39a7b2c8d1e4
Revises: a1b2c3d4e5f6
Create Date: 2026-06-07 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "39a7b2c8d1e4"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_transactions_user_id_updated_at",
        "transactions",
        ["user_id", "updated_at"],
        unique=False,
    )
    op.create_index(
        "ix_accounts_user_id_updated_at",
        "accounts",
        ["user_id", "updated_at"],
        unique=False,
    )
    op.create_index(
        "ix_categories_user_id_updated_at",
        "categories",
        ["user_id", "updated_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_id_updated_at", table_name="transactions")
    op.drop_index("ix_accounts_user_id_updated_at", table_name="accounts")
    op.drop_index("ix_categories_user_id_updated_at", table_name="categories")
