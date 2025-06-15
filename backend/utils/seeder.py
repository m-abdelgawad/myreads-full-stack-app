from pathlib import Path
import json
from sqlalchemy.orm import Session

from database import SessionLocal
from models.book import Book as BookORM


def seed_books() -> None:
    """
    Import starter books from `data/mock_books.json` once.
    Ignores rows already present (by primary key) and duplicates in input file.
    """
    data_path = Path(__file__).resolve().parent.parent / "data" / "mock_books.json"
    if not data_path.exists():
        print("❌ mock_books.json not found, skipping seed.")
        return

    with data_path.open("r", encoding="utf-8") as f:
        raw_books = json.load(f).get("books", [])

    # Build a dictionary of unique books by ID (last one wins)
    unique_books = {}
    for b in raw_books:
        book_id = b.get("id")
        if book_id:  # Ensure ID is present
            unique_books[book_id] = b

    db: Session = SessionLocal()
    inserted = 0
    updated = 0

    for b in unique_books.values():
        existing = db.query(BookORM).filter(BookORM.id == b["id"]).first()
        description = b.get("description", "")
        if not existing:
            db.add(
                BookORM(
                    id=b["id"],
                    title=b["title"],
                    authors=", ".join(b.get("authors", [])),
                    thumbnail=b.get("imageLinks", {}).get("thumbnail", ""),
                    description=description,
                )
            )
            inserted += 1
        elif existing.description != description:
            existing.description = description
            updated += 1

    db.commit()
    db.close()

    msg = f"✅ Seeded {inserted} new books." if inserted else "ℹ️  No new books to seed."
    if updated:
        msg += f" ✏️ Updated description for {updated} existing books."
    print(msg)
