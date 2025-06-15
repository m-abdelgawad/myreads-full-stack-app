from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from utils.seeder import seed_books
from routers import auth, books

# ─── Seed once if flag on ───────────────────────────────────────
if settings.SEED_DB:
    seed_books()

# ─── FastAPI app ────────────────────────────────────────────────
app = FastAPI(title="MyReads Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(books.router)


@app.get("/")
def root():
    return {"status": "running"}
