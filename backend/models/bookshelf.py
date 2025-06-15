from sqlalchemy import Column, Integer, ForeignKey, String, UniqueConstraint
from database import Base


class UserBookShelf(Base):
    """
    Pivot table mapping each user to a book *and* the shelf they chose.

    • user_id + book_id are unique together
    • shelf is one of: currentlyReading | wantToRead | read
    """
    __tablename__ = "user_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    shelf = Column(String, nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "book_id", name="uq_user_book"),)
