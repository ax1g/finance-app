"""add_currency_to_users

Revision ID: 5ea4b1d9a612
Revises: 568cdd435c62
Create Date: 2026-06-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5ea4b1d9a612'
down_revision: Union[str, Sequence[str], None] = '568cdd435c62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('currency', sa.String(length=3), nullable=False, server_default='USD'))


def downgrade() -> None:
    op.drop_column('users', 'currency')
