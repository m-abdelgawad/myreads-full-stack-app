from typing import List, Optional
from pydantic import BaseModel


class ImageLinks(BaseModel):
    thumbnail: Optional[str] = None


class Book(BaseModel):
    id: str
    title: str
    authors: Optional[List[str]] = []
    shelf: Optional[str] = None          # filled per-user via pivot
    imageLinks: Optional[ImageLinks] = None
    description: Optional[str] = None  # Book description
