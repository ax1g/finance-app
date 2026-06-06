"""rename Business Meals to Bank Charges

Revision ID: e2c5b8f1a3d4
Revises: f9504b1577ca
Create Date: 2026-06-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'e2c5b8f1a3d4'
down_revision: Union[str, Sequence[str], None] = 'f9504b1577ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE categories SET name = 'Bank Charges', icon = '🏦', description = 'Bank fees, service charges, and penalties' "
        "WHERE name = 'Business Meals'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE categories SET name = 'Business Meals', icon = '🍽️', description = 'Client meetings and business meals' "
        "WHERE name = 'Bank Charges'"
    )
