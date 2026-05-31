"""add soft delete fields to categories

Revision ID: 568cdd435c62
Revises: f1ea8b784ecb
Create Date: 2026-05-29 19:27:57.838499

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '568cdd435c62'
down_revision: Union[str, Sequence[str], None] = 'f1ea8b784ecb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the enum type first
    categorystatus = sa.Enum('ACTIVE', 'CLOSED', 'ARCHIVED', name='categorystatus')
    categorystatus.create(op.get_bind())

    # Add nullable column so existing rows don't cause a check failure
    op.add_column(
        'categories',
        sa.Column(
            'status',
            categorystatus,
            nullable=True,
        ),
    )

    # Backfill existing rows with ACTIVE
    op.execute("UPDATE categories SET status = 'ACTIVE'")

    # Now set NOT NULL
    op.alter_column('categories', 'status', nullable=False)

    # Add closed_at column
    op.add_column(
        'categories',
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('categories', 'closed_at')
    op.drop_column('categories', 'status')

    # Drop the enum type
    categorystatus = sa.Enum('ACTIVE', 'CLOSED', 'ARCHIVED', name='categorystatus')
    categorystatus.drop(op.get_bind())
