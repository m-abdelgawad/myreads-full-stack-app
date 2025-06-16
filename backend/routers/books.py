"""
routers/books.py
─────────────────
FastAPI router for book & shelf operations.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.dependencies import get_db, get_current_user
from models.book import Book as BookORM
from models.bookshelf import UserBookShelf as Pivot
from models.user import User
from schemas.book import Book, ImageLinks

# ────────────────────────────────────────────────────────────────────
# Pydantic payloads
# ────────────────────────────────────────────────────────────────────
class ShelfUpdate(BaseModel):
    shelf: Optional[str] = None           # null / "" clears shelf


class SearchPayload(BaseModel):
    query: str
    maxResults: int = 20


# ────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/books", tags=["books"])
# (Each route still has user: User = Security(get_current_user))

# ────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────
def to_schema(book: BookORM, shelf: Optional[str] = None) -> Book:
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


def _shelf_for(user_id: str, book_id: str, db: Session) -> Optional[str]:
    row = db.query(Pivot.shelf).filter_by(user_id=user_id, book_id=book_id).first()
    return row[0] if row else None


# ────────────────────────────────────────────────────────────────────
# SEARCH (declare BEFORE /{book_id} to avoid 404)
# ────────────────────────────────────────────────────────────────────
def _run_search(db: Session, user: User, query: str, max_results: int) -> List[Book]:
    q = f"%{query.lower()}%"
    hits = (
        db.query(BookORM)
        .filter((BookORM.title.ilike(q)) | (BookORM.authors.ilike(q)))
        .limit(max_results)
        .all()
    )
    return [to_schema(b, _shelf_for(user.id, b.id, db)) for b in hits]


@router.post("/search", response_model=List[Book])
def search_post(
    payload: SearchPayload,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    return _run_search(db, user, payload.query, payload.maxResults)


@router.get("/search", response_model=List[Book])
def search_get(
    query: str = Query(..., min_length=1),
    maxResults: int = 20,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    return _run_search(db, user, query, maxResults)


# ────────────────────────────────────────────────────────────────────
# CRUD
# ────────────────────────────────────────────────────────────────────
@router.get("", response_model=List[Book])
def list_books(
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    books = db.query(BookORM).all()
    return [to_schema(b, _shelf_for(user.id, b.id, db)) for b in books]


@router.get("/{book_id}", response_model=Book)
def get_book(
    book_id: str,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    book = db.query(BookORM).filter(BookORM.id == book_id).first()
    if not book:
        raise HTTPException(404, "Book not found")
    return to_schema(book, _shelf_for(user.id, book_id, db))


@router.put("/{book_id}", response_model=Book)
def move_book(
    book_id: str,
    payload: ShelfUpdate,
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    valid = {"currentlyReading", "wantToRead", "read"}
    if payload.shelf not in valid and payload.shelf not in {None, "", "null"}:
        raise HTTPException(400, "Invalid shelf value")

    pivot = db.query(Pivot).filter_by(user_id=user.id, book_id=book_id).first()

    # clear shelf
    if payload.shelf in {None, "", "null"}:
        if pivot:
            db.delete(pivot)
            db.commit()
        book = db.query(BookORM).filter(BookORM.id == book_id).first()
        return to_schema(book)

    # upsert pivot
    if not pivot:
        pivot = Pivot(user_id=user.id, book_id=book_id, shelf=payload.shelf)
        db.add(pivot)
    else:
        pivot.shelf = payload.shelf
    db.commit()

    book = db.query(BookORM).filter(BookORM.id == book_id).first()
    return to_schema(book, payload.shelf)

@router.get("/shelved", response_model=List[Book])
def list_shelved(
    db: Session = Depends(get_db),
    user: User = Security(get_current_user),
):
    rows = (
        db.query(BookORM)
        .join(Pivot, Pivot.book_id == BookORM.id)
        .filter(Pivot.user_id == user.id)
        .all()
    )
    return [to_schema(b, _shelf_for(user.id, b.id, db)) for b in rows]