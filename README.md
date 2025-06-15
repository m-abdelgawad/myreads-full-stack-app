
# MyReads — Full-Stack Bookshelf App
*A reference implementation of a modern, container-first FastAPI + React/Vite SPA*

---

## 1. Business & Solution Overview
| Pillar | Detail                                                                                                                                                                                                   |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Problem** | Personal reading trackers are often split between clunky spreadsheets or single-device mobile apps.                                                                                                      |
| **Goal** | Provide a unified **web** experience where each user can search, shelf, and track books from any device.                                                                                                 |
| **Architecture** | **Front-end** (Vite + React) served by a tiny Nginx, **FastAPI** back end, Postgres database, all orchestrated via Docker Compose and routed through a **central, TLS-terminating Nginx** reverse-proxy. |

---

## 2. Folder Structure
```
myreads-app/
├── backend/           # FastAPI source, Alembic migrations, Dockerfile
│   ├── alembic/...
│   ├── routers/...
│   ├── models/...
│   ├── main.py
│   └── Dockerfile
├── frontend/          # React + Vite SPA, micro-Nginx, Dockerfile
│   ├── src/...
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md          # ← you are here
```

---

## 3. Backend (FastAPI)
### 3.1 Local setup (SQLite)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn backend.main:app --reload
```

`.env` (dev)
```env
DB_ENGINE=sqlite
DATABASE_URL=sqlite:///./myreads.db
SEED_DB=true
```

### 3.2 Production setup (Postgres)
Create database inside existing Postgres container:
```bash
docker exec -it postgres_db psql -U postgres   -c "CREATE DATABASE myreads;"   -c "CREATE USER dbuser WITH PASSWORD 'Super$ecret1';"   -c "GRANT ALL PRIVILEGES ON DATABASE myreads TO dbuser;"
```

`.env.production`
```env
DB_ENGINE=postgres
DATABASE_URL=postgresql+psycopg2://dbuser:Super$ecret1@postgres_db:5432/myreads
SEED_DB=true
SECRET_KEY=<32+ char random>
```

Dockerfile runs `alembic upgrade head` automatically.

### 3.3 Backend Dockerfile (two-stage)
```dockerfile
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

```

---

## 4. Frontend (React + Vite)
### 4.1 Local dev against **local** API
```bash
# frontend/.env
VITE_API_URL=http://127.0.0.1:8000
```
```bash
cd frontend
npm install
npm run dev
```

### 4.2 Local dev against **hosted** API
```bash
# frontend/.env
VITE_API_URL=https://myreads.automagicdeveloper.com/api/
```
```bash
cd frontend
npm install
npm run dev
```

### 4.3 Frontend Dockerfile (two-stage + micro-Nginx)
```dockerfile
# ──────────────── Stage 1 – compile SPA assets ────────────────
FROM node:20-alpine AS builder
WORKDIR /opt/web
COPY package*.json ./
RUN npm ci
COPY . .
# Runtime API endpoint baked at build-time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build            # outputs to /opt/web/dist

# ──────────────── Stage 2 –   ultra-slim web server ───────────
FROM nginx:1.27-alpine
COPY --from=builder /opt/web/dist /usr/share/nginx/html
# Optional: Single-page-app history-fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

`frontend/nginx.conf`
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    location / { try_files $uri /index.html; }
}
```

---

## 5. Docker Compose
```yaml
version: "3.9"

services:
  myreads-backend:
    build: ./backend
    container_name: myreads-backend
    env_file: ./backend/.env.production
    restart: unless-stopped
    networks: [nginx_network]

  myreads-frontend:
    build:
      context: ./frontend
    container_name: myreads-frontend
    env_file: ./frontend/.env.production
    depends_on: [myreads-backend]
    restart: unless-stopped
    networks: [nginx_network]

networks:
  nginx_network:
    external: true

```

---

## 6. Nginx Reverse Proxy
```nginx
# ================================================================
# HTTPS Server Block for MyReads
# ================================================================
server {
    listen 443 ssl;
    http2 on;
    server_name myreads.automagicdeveloper.com;

    set $myreads_frontend_host myreads-frontend;
    set $myreads_backend_host myreads-backend;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!3DES;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_proxied any;
    gzip_min_length 256;
    gzip_comp_level 5;
    gzip_vary on;

    # Proxy Buffering
    proxy_buffer_size          128k;
    proxy_buffers              4 256k;
    proxy_busy_buffers_size    256k;
    proxy_temp_file_write_size 256k;

    # Proxy to aistoreassistant app
    location / {
        proxy_pass http://$myreads_frontend_host:80;
        proxy_pass_request_headers on;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
    }
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://$myreads_backend_host:8000;
        proxy_pass_request_headers on;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

---

## 7. API Reference

Key endpoints:  
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/books`
- `PUT /api/books/{id}`
- `POST /api/books/search?query=`
- Swagger docs: `/docs`

---

## 8. Issues Faced
| Issue | Solution |
|-------|----------|
| JWT not sent | Added `proxy_set_header Authorization` |
| filter() error | Fixed Nginx rewrite stripping `/api` correctly |
| bcrypt version error | Pinned bcrypt <4.1 |

---

## 9. Reviewer Experience
```bash
# frontend/.env
VITE_API_URL=https://myreads.automagicdeveloper.com/api/
```
```bash
cd frontend
npm install
npm run dev
```
No backend or DB setup required. Book data and users are isolated.

## Contact

Mohamed AbdelGawad Ibrahim - [@m-abdelgawad](https://www.linkedin.com/in/m-abdelgawad/) - <a href="tel:+201069052620">
+201069052620</a> - muhammadabdelgawwad@gmail.com

GitHub Profile Link: [https://github.com/m-abdelgawad](https://github.com/m-abdelgawad)

<p align="right">(<a href="#readme-top">back to top</a>)</p>