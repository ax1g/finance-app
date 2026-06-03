"""add_currency_custom_symbol_to_users

Revision ID: 6b2f1c3d8e4f
Revises: 5ea4b1d9a612
Create Date: 2026-06-03 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '6b2f1c3d8e4f'
down_revision: Union[str, Sequence[str], None] = '5ea4b1d9a612'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('currency_custom_symbol', sa.String(length=10), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'currency_custom_symbol')
