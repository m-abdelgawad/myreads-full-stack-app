from pathlib import Path
import json
from sqlalchemy.orm import Session

from database import SessionLocal
from models.book import Book as BookORM


def seed_books() -> None:
    """
    Import starter books from `data/mock_books.json` once.
    Ignores rows already present (by primary key).
    """
    data_path = Path(__file__).resolve().parent.parent / "data" / "mock_books.json"
    if not data_path.exists():
        print("❌ mock_books.json not found, skipping seed.")
        return

    with data_path.open("r", encoding="utf-8") as f:
        books_raw = json.load(f)["books"]

    db: Session = SessionLocal()
    inserted = 0
    updated = 0
    for b in books_raw:
        book = db.query(BookORM).filter(BookORM.id == b["id"]).first()
        desc = b.get("description", "")
        if not book:
            db.add(
                BookORM(
                    id=b["id"],
                    title=b["title"],
                    authors=", ".join(b.get("authors", [])),
                    thumbnail=b.get("imageLinks", {}).get("thumbnail", ""),
                    description=desc,
                )
            )
            inserted += 1
        else:
            if book.description != desc:
                book.description = desc
                updated += 1

    db.commit()
    db.close()
    msg = f"Seeded {inserted} new books." if inserted else "ℹ️  No new books to seed."
    if updated:
        msg += f" Updated description for {updated} existing books."
    print(msg)
