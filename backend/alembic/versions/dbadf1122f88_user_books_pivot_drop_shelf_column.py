"""user_books pivot & drop shelf column

Revision ID: b2d1c8f4d1a9
Revises: 7ec848372607
Create Date: 2025-06-05 14:50:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b2d1c8f4d1a9"
down_revision = "7ec848372607"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. create new pivot table
    op.create_table(
        "user_books",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("book_id", sa.String(), sa.ForeignKey("books.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shelf", sa.String(), nullable=False),
        sa.UniqueConstraint("user_id", "book_id", name="uq_user_book"),
    )

    # 2. drop ‘shelf’ column from books
    with op.batch_alter_table("books") as batch_op:
        batch_op.drop_column("shelf")


def downgrade() -> None:
    with op.batch_alter_table("books") as batch_op:
        batch_op.add_column(sa.Column("shelf", sa.String(), nullable=True))

    op.drop_table("user_books")
