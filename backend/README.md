# MyReads Full-Stack Demo (FastAPI + JWT + React)

A complete re-implementation of Udacity’s **MyReads** Bookshelf app backend.  
You’ll learn:

* FastAPI fundamentals (routing, dependency injection, Pydantic v2)
* SQLAlchemy + Alembic (SQLite dev, Postgres prod)
* Secure JWT authentication (access / refresh tokens)
* Building a clean, layered project structure
* Automatic Swagger / OpenAPI docs

When you finish reading, you should be able to rebuild every line from scratch.

---

## 📁 Folder Structure (top level)

Path | Purpose
---- | -------
`main.py` | FastAPI application factory, wires routers & middleware.
`config.py` | Loads `.env` via pydantic-settings. Centralised config.
`database.py` | SQLAlchemy engine/session + Base.
`alembic/` | DB migrations; `env.py` dynamically injects DB URL.
`models/` | SQLAlchemy ORM tables.<br>  `book.py`, `user.py`, `__init__.py`.
`schemas/` | Pydantic v2 DTOs (request / response models).
`core/` | Cross-cutting concerns: security & dependencies.
`routers/` | Feature-oriented route groups (`auth.py`, `books.py`).
`utils/seeder.py` | One-shot JSON → DB importer.
`data/mock_books.json` | Udacity starter data (exact schema).

---

## 🔧 Step-by-Step Setup

1. **Clone / create venv**

       python -m venv venv
       source venv/bin/activate  (Windows: venv\Scripts\activate)

2. **Install deps**

       pip install -r requirements.txt

3. **Configure `.env`**

       DB_ENGINE=sqlite
       DATABASE_URL=sqlite:///./myreads.db
       SECRET_KEY=replace_with_32+_chars
       SEED_DB=true

   Flip `DB_ENGINE` and `DATABASE_URL` for Postgres later.

4. **Run migrations**

       alembic revision --autogenerate -m "init"
       alembic upgrade head

5. **Seed books (optional)**  
   `utils/seeder.py` reads `mock_books.json` if `SEED_DB=true`.

6. **Launch dev server**

       uvicorn main:app --reload

7. **Open docs**

       http://localhost:8000/docs  
       Use **/auth/signup** → **/auth/login** to generate an access token, click **Authorize**, paste token. All `/books/*` routes become callable.

---

## 🗄  Database Layer

### `database.py`

* Builds `engine` from `config.DATABASE_URL`.
* Creates `SessionLocal` factory (`autocommit=False`, `autoflush=False`).
* Exposes declarative `Base` used by every model.

### `models/book.py`
```
class Book(Base):
tablename = "books"
id = Column(String, primary_key=True)
title = Column(String, nullable=False)
authors = Column(String) # CSV
shelf = Column(String) # wantToRead | currentlyReading | read
thumbnail = Column(String) # URL
```


### `models/user.py`

* Stores **hashed** passwords (`passlib[bcrypt]`).
* `is_active` flag lets you soft-deactivate accounts.

`models/__init__.py` imports both tables so `Base.metadata` sees them for Alembic autogeneration.

---

## 📝  Configuration

### `config.py`

* Powered by **pydantic-settings**.  
  Each `.env` key becomes a typed attribute.

```angular2html
settings.DATABASE_URL
settings.SECRET_KEY
settings.ACCESS_TOKEN_EXPIRE_MINUTES
settings.SEED_DB
```


### Switching databases

*Dev* → SQLite  
*Prod* → Postgres

```angular2html
DB_ENGINE=postgres
DATABASE_URL=postgresql+psycopg2://user:pass@db/myreads
```

No code changes required.

---

## 🔐  Security Layer

### `core/security.py`

Function | Role
-------- | ----
`hash_password()` / `verify_password()` | Bcrypt hashing.
`create_access_token()` | Short-lived (default 15 min).
`create_refresh_token()` | Long-lived (default 7 days).
`decode_token()` | Returns `user_id` or `None`.

Internally uses **python-jose** with `HS256` and `settings.SECRET_KEY`.

### `core/dependencies.py`

Dependency | What it injects
---------- | ---------------
`get_db()` | SQLAlchemy session per request (closes automatically).
`get_current_user()` | Validates `Authorization: Bearer <JWT>` header and returns `models.user.User`.

`bearer_scheme = HTTPBearer(...)` tells FastAPI to add a **single JWT field** in Swagger’s Authorize popup.

---

## 🌐  Router Layer

### `/auth`  (`routers/auth.py`)

Method | Purpose | Body model
------ | ------- | ----------
`POST /auth/signup` | Create user | `schemas.user.UserCreate`
`POST /auth/login` | Return access + refresh JWT | `UserCreate`
`POST /auth/refresh` | Refresh tokens | raw string refresh_token

All return `schemas.user.UserOut` or `schemas.token.Token`.

### `/books`  (`routers/books.py`)

*Entire router protected*:   `dependencies=[Security(get_current_user)]`

Endpoint | Purpose | Notes
-------- | ------- | -----
`GET /books/` | List all books |
`GET /books/{id}` | Single book |
`PUT /books/{id}?shelf=x` | Change shelf (exactly like Udacity `update`) |
`POST /books/search` | Body :`query`, `maxResults` → fuzzy title/author search |

Helper `orm_to_schema()` converts `models.book.Book` → `schemas.book.Book` (Pydantic).

---

## ♻️  Seeder

`utils/seeder.py`

* Reads `data/mock_books.json` (`{ "books": [...] }`)
* Skips rows already in DB (`id` duplication check)
* Enabled once via `SEED_DB=true`

After the first successful import, set `SEED_DB=false` to boot faster.

---

## 🏗  How Everything Connects

1. **FastAPI** starts → `main.py` imports routers.
2. Each request:
   * **Middleware** attaches CORS headers.
   * `get_current_user` (via HTTP bearer) decodes JWT → queries DB.
   * `get_db` gives a unit-of-work session to route handler.
3. Route returns a **Pydantic schema** → FastAPI serialises to JSON.
4. Swagger UI auto-builds OpenAPI 3.0 from routes, models & security schemes.

---

## 🚦  Re-Develop Checklist

Re-implement from scratch by repeating these milestones:

1. Create venv, install FastAPI, SQLAlchemy, Alembic.  
2. Design `.env` + `config.py`.  
3. Build `database.py` and verify `Base.metadata` empty.  
4. Create `models.book.Book` → autogenerate migration.  
5. Build `schemas.book` Pydantic mirror.  
6. Wire `routers/books.py` (no auth yet) → test `/docs`.  
7. Add `models.user.User`, `core/security.py`, `core/dependencies.py`.  
8. Implement `/auth` router, hash + JWT.  
9. Switch `/books` router to `dependencies=[Security(get_current_user)]`.  
10. Build React front-end (Vite) pointing to `.env VITE_API_URL`.  
11. Flip to Postgres, run Alembic `upgrade head`, deploy 🚀.

---

## 🗃  Reference: Complete API List

Verb | URL | Body | Auth? | Mirrors Udacity
---- | --- | ---- | ----- | ---------------
GET | `/books/` | — | ✔︎ access | `getAll`
GET | `/books/{id}` | — | ✔︎ access | `get`
PUT | `/books/{id}?shelf=wantToRead` | — | ✔︎ access | `update`
POST | `/books/search` | query, maxResults | ✔︎ access | `search`
POST | `/auth/signup` | email, password | ✘ | —
POST | `/auth/login` | email, password | ✘ | —
POST | `/auth/refresh` | refresh_token | ✘ | —

---

## 🧑‍💻  Next Ideas for Practice

* Store `authors` in a separate `book_authors` table (1-N).
* Issue HttpOnly cookie for refresh token instead of JSON payload.
* Add pagination to `/books/`.
* Write PyTest integration tests with FastAPI’s TestClient.
* Dockerise Postgres + backend; deploy to Render, Railway, or Fly.io.

Happy coding – build it, break it, rebuild it!  