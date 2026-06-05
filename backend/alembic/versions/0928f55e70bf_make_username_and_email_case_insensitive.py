"""make username and email case-insensitive

Revision ID: 0928f55e70bf
Revises: 9d039e81b1fc
Create Date: 2026-06-05 17:07:53.874241

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0928f55e70bf'
down_revision: Union[str, Sequence[str], None] = '9d039e81b1fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.execute(
        "UPDATE users SET username = LOWER(username), email = LOWER(email)"
    )
    op.create_index(
        "ix_users_lower_username", "users",
        [sa.text("LOWER(username)")], unique=True,
    )
    op.create_index(
        "ix_users_lower_email", "users",
        [sa.text("LOWER(email)")], unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_users_lower_username", table_name="users")
    op.drop_index("ix_users_lower_email", table_name="users")
    op.create_index(
        op.f("ix_users_username"), "users", ["username"], unique=True,
    )
    op.create_index(
        op.f("ix_users_email"), "users", ["email"], unique=True,
    )
