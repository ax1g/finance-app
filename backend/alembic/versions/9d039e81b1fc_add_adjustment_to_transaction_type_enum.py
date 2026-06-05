"""add adjustment to transaction type enum

Revision ID: 9d039e81b1fc
Revises: 6b2f1c3d8e4f
Create Date: 2026-06-05 14:27:56.507803

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "9d039e81b1fc"
down_revision: Union[str, Sequence[str], None] = "6b2f1c3d8e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE transactiontype ADD VALUE 'ADJUSTMENT'")


def downgrade() -> None:
    op.execute("ALTER TYPE transactiontype RENAME TO transactiontype_old")
    op.execute("CREATE TYPE transactiontype AS ENUM('INCOME', 'EXPENSE', 'TRANSFER')")
    op.execute(
        "ALTER TABLE transactions ALTER COLUMN txn_type TYPE transactiontype USING "
        "txn_type::text::transactiontype"
    )
    op.execute("DROP TYPE transactiontype_old")
