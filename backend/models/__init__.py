from .book import Book
from .user import User
from .bookshelf import UserBookShelf     # <— NEW

__all__: list[str] = ["Book", "User", "UserBookShelf"]
