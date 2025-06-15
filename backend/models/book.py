from sqlalchemy import Column, String, Text
from database import Base


class Book(Base):
    __tablename__ = "books"

    id          = Column(String, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    authors     = Column(String)          # "Neil Gaiman, Terry Pratchett"
    thumbnail   = Column(String)          # URL
    description = Column(Text)            # Book description text
