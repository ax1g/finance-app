"""add system to category type enum

Revision ID: a1b2c3d4e5f6
Revises: e2c5b8f1a3d4
Create Date: 2026-06-06 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "e2c5b8f1a3d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE categorytype ADD VALUE 'SYSTEM'")


def downgrade() -> None:
    op.execute("ALTER TYPE categorytype RENAME TO categorytype_old")
    op.execute("CREATE TYPE categorytype AS ENUM('INCOME', 'EXPENSE')")
    op.execute(
        "ALTER TABLE categories ALTER COLUMN type TYPE categorytype USING "
        "type::text::categorytype"
    )
    op.execute("DROP TYPE categorytype_old")
