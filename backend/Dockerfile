# ──────────────── Stage 1 – build deps (cache-friendly) ────────────────
FROM python:3.13-slim AS builder
WORKDIR /opt/app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ──────────────── Stage 2 – runtime ────────────────────────────────────
FROM python:3.13-slim
# 1️⃣  deterministic, non-root UID
RUN useradd -m -u 1001 myreads
WORKDIR /opt/app
ENV PYTHONUNBUFFERED=1 \
    # Allow gunicorn to pick workers = 2 × vCPU + 1
    GUNICORN_CMD_ARGS="--workers 3 --bind 0.0.0.0:8000 --log-level info"
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . .

# Run migrations (idempotent) then start ASGI server
CMD bash -c "alembic upgrade head && gunicorn main:app -k uvicorn.workers.UvicornWorker"
