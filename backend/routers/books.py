from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from core.dependencies import get_db, get_current_user
from models.book import Book as BookORM
from models.bookshelf import UserBookShelf as Pivot
from models.user import User
from schemas.book import Book, ImageLinks


class ShelfUpdate(BaseModel):
    shelf: Optional[str] = None


router = APIRouter(
    prefix="/books",
    tags=["books"],
    dependencies=[Security(get_current_user)],          # every op needs JWT
)


# ─── helpers ────────────────────────────────────────────────────
def to_schema(book: BookORM, shelf: str | None = None) -> Book:
    """Convert ORM row → Pydantic schema, attaching the user-specific shelf."""
    img = ImageLinks(thumbnail=book.thumbnail) if book.thumbnail else None
    authors = book.authors.split(", ") if book.authors else []
    return Book(
        id=book.id,
        title=book.title,
        authors=authors,
        shelf=shelf,
        imageLinks=img,
        description=book.description,
    )


def _shelf_for(user_id: str, book_id: str, db: Session) -> str | None:
    """Return the shelf this user assigned to the book (or None)."""
    row = db.query(Pivot.shelf).filter_by(user_id=user_id, book_id=book_id).first()
    return row[0] if row else None


# ─── GET /books/  –  SHOW EVERY BOOK  ───────────────────────────
@router.get("", response_model=List[Book])
def list_books(
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    """
    Return **all** books in the database.
    If the current user previously moved a book to a shelf,
    that shelf is included; otherwise `shelf=None`.
    """
    books = db.query(BookORM).all()                     # ← removed inner-join
    return [to_schema(b, _shelf_for(user.id, b.id, db)) for b in books]


# ─── GET /books/{id} ────────────────────────────────────────────
@router.get("/{book_id}", response_model=Book)
def get_book(
    book_id: str,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    book = db.query(BookORM).filter(BookORM.id == book_id).first()
    if not book:
        raise HTTPException(404, "Book not found")
    shelf = _shelf_for(user.id, book_id, db)
    return to_schema(book, shelf)


# ─── PUT /books/{id} – (move to shelf / remove) ─────────────────
@router.put("/{book_id}", response_model=Book)
def move_book(
    book_id: str,
    payload: ShelfUpdate,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    """
    Store or clear the user-specific shelf in pivot table.
    """
    # Update validation to accept null, empty string, and "null"
    if payload.shelf not in {"currentlyReading", "wantToRead", "read", "null", ""} and payload.shelf is not None:
        raise HTTPException(400, "Invalid shelf value")

    pivot = db.query(Pivot).filter_by(user_id=user.id, book_id=book_id).first()

    if payload.shelf == "null" or payload.shelf == "" or payload.shelf is None:
        if pivot:
            db.delete(pivot)
            db.commit()
        return to_schema(db.query(BookORM).filter(BookORM.id == book_id).first())

    if not pivot:
        pivot = Pivot(user_id=user.id, book_id=book_id, shelf=payload.shelf)
        db.add(pivot)
    else:
        pivot.shelf = payload.shelf

    db.commit()
    return to_schema(db.query(BookORM).filter(BookORM.id == book_id).first())


# ─── POST /books/search ────────────────────────────────────────
@router.post("/search", response_model=List[Book])
def search(
    query: str,
    maxResults: int = 20,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    q = f"%{query.lower()}%"
    hits = (
        db.query(BookORM)
        .filter((BookORM.title.ilike(q)) | (BookORM.authors.ilike(q)))
        .limit(maxResults)
        .all()
    )
    return [to_schema(b, _shelf_for(user.id, b.id, db)) for b in hits]
