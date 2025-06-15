# MyReads — Full-Stack Bookshelf App
*A modern, production-ready FastAPI + React/Vite application with JWT authentication and multi-user book tracking*

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

---

## 📋 Table of Contents

1. [🚀 Overview](#-overview)
2. [🏗️ Architecture Highlights](#️-architecture-highlights)
3. [📁 Project Structure](#-project-structure)
4. [🛠 Backend Setup](#-backend-setup)
   - [Development Environment (SQLite)](#development-environment-sqlite)
   - [Production Environment (PostgreSQL)](#production-environment-postgresql)
   - [Configuration Options](#configuration-options)
5. [🎨 Frontend Setup](#-frontend-setup)
6. [🐳 Docker Deployment](#-docker-deployment)
7. [🔒 Security Features](#-security-features)
8. [📚 API Reference](#-api-reference)
9. [🗄 Database Schema](#-database-schema)
10. [🔧 Development Workflow](#-development-workflow)
11. [⚙️ CI/CD Pipeline](#️-cicd-pipeline)
12. [🚀 Production Deployment](#-production-deployment)
13. [🔍 Troubleshooting](#-troubleshooting)
13. [🚦 Getting Started (Quick Start)](#-getting-started-quick-start)
14. [📈 Future Enhancements](#-future-enhancements)
15. [📞 Contact & Support](#-contact--support)
16. [🤝 Contributing](#-contributing)
17. [📄 License](#-license)

---

## 🚀 Overview

MyReads is a comprehensive bookshelf management application that allows users to:
- **Search** for books with intelligent fuzzy matching
- **Organize** books into three shelves: "Want to Read", "Currently Reading", and "Read"
- **Track** personal reading progress with user-specific shelves
- **Authenticate** securely with JWT tokens (access + refresh)
- **Scale** from development (SQLite) to production (PostgreSQL) seamlessly

### Screenshots
* Home Page

![](.\readme_files\homepage.png)

* Search Page

![](.\readme_files\search.png)

* Book Details Page

![](.\readme_files\book_detail.png)

* Login

![](.\readme_files\login.png)

* Sign Up

![](.\readme_files\signup.png)

## 🏗️ Architecture Highlights

- **Backend**: FastAPI with SQLAlchemy ORM, Alembic migrations, JWT authentication
- **Frontend**: React + Vite SPA with modern UI/UX
- **Database**: SQLite for development, PostgreSQL for production
- **Deployment**: Docker Compose with Nginx reverse proxy and SSL termination
- **Security**: Bcrypt password hashing, JWT tokens, CORS handling

---

## 📁 Project Structure

```
myreads-app/
├── backend/                    # FastAPI application
│   ├── alembic/               # Database migrations
│   │   ├── versions/          # Migration files
│   │   └── env.py            # Alembic configuration
│   ├── core/                  # Cross-cutting concerns
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   └── security.py       # JWT & password utilities
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── book.py           # Book entity
│   │   ├── user.py          # User entity
│   │   └── bookshelf.py     # User-Book relationship
│   ├── routers/              # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   └── books.py         # Book management endpoints
│   ├── schemas/              # Pydantic request/response models
│   │   ├── book.py          # Book DTOs
│   │   ├── user.py          # User DTOs
│   │   └── token.py         # JWT token models
│   ├── utils/               # Utilities
│   │   └── seeder.py        # Database seeding
│   ├── data/               # Static data
│   │   └── mock_books.json  # Sample book data
│   ├── main.py             # FastAPI application factory
│   ├── config.py           # Configuration management
│   ├── database.py         # Database setup
│   └── Dockerfile          # Multi-stage production build
├── frontend/               # React + Vite SPA
│   ├── src/               # React source code
│   ├── nginx.conf         # Frontend server configuration
│   └── Dockerfile         # Multi-stage frontend build
├── docker-compose.yml     # Container orchestration
└── README.md             # This file
```

---

## 🛠 Backend Setup

### Development Environment (SQLite)

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment variables**
   
   Create `.env` file:
   ```env
   MODE=dev
   DB_ENGINE=sqlite
   DB_NAME=myreads.db
   DB_HOST=localhost
   SEED_DB=true
   ```
   
   Create `.secrets` file:
   ```env
   SECRET_KEY=your-super-secret-key-minimum-32-characters
   ```

3. **Initialize database**
   ```bash
   alembic upgrade head
   ```

4. **Start development server**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access API documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Production Environment (PostgreSQL)

1. **Setup PostgreSQL database**
   ```bash
   # Connect to PostgreSQL and create database
   docker exec -it postgres_db psql -U postgres
   CREATE DATABASE myreads;
   CREATE USER dbuser WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE myreads TO dbuser;
   \q
   ```

2. **Configure production environment**
   
   Create `.env.production`:
   ```env
   MODE=production
   DB_ENGINE=postgres
   DB_NAME=myreads
   DB_HOST=postgres_db
   DB_PORT=5432
   DB_USER=dbuser
   SEED_DB=true
   ```
   
   Create `.secrets.production`:
   ```env
   SECRET_KEY=production-secret-key-very-long-and-secure
   DB_PASSWORD=your_secure_password
   ```

### Configuration Options

| Variable | Description | Default | Examples |
|----------|-------------|---------|----------|
| `MODE` | Environment mode | `dev` | `dev`, `production` |
| `DB_ENGINE` | Database type | `sqlite` | `sqlite`, `postgres` |
| `DB_NAME` | Database name | - | `myreads.db`, `myreads` |
| `DB_HOST` | Database host | `localhost` | `localhost`, `postgres_db` |
| `DB_PORT` | Database port | `5432` | `5432`, `3306` |
| `DB_USER` | Database user | - | `dbuser`, `postgres` |
| `DB_PASSWORD` | Database password | - | (in .secrets file) |
| `SECRET_KEY` | JWT signing key | - | (32+ character string) |
| `SEED_DB` | Auto-seed database | `true` | `true`, `false` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token TTL | `15` | `15`, `30`, `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | JWT refresh token TTL | `7` | `7`, `30` |

---

## 🎨 Frontend Setup

### Development Against Local Backend

1. **Configure environment**
   ```bash
   # frontend/.env
   VITE_API_URL=http://127.0.0.1:8000
   ```

2. **Install and run**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Development Against Production Backend

1. **Configure environment**
   ```bash
   # frontend/.env
   VITE_API_URL=https://myreads.automagicdeveloper.com/api
   ```

2. **Install and run**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🐳 Docker Deployment

### Multi-Stage Backend Dockerfile

The backend uses an optimized two-stage build:

```dockerfile
# Stage 1: Build dependencies (cached)
FROM python:3.13-slim AS builder
WORKDIR /opt/app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.13-slim
RUN useradd -m -u 1001 myreads
WORKDIR /opt/app
ENV PYTHONUNBUFFERED=1 \
    GUNICORN_CMD_ARGS="--workers 3 --bind 0.0.0.0:8000 --log-level info"
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
COPY . .
CMD bash -c "alembic upgrade head && gunicorn main:app -k uvicorn.workers.UvicornWorker"
```

### Multi-Stage Frontend Dockerfile

```dockerfile
# Stage 1: Build SPA
FROM node:20-alpine AS builder
WORKDIR /opt/web
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine
COPY --from=builder /opt/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

### Docker Compose Configuration

```yaml
version: "3.9"

services:
  myreads-backend:
    build: ./backend
    container_name: myreads-backend
    env_file: ./backend/.env.production
    restart: unless-stopped
    networks: [nginx_network]
    depends_on: [postgres_db]

  myreads-frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: /api
    container_name: myreads-frontend
    restart: unless-stopped
    networks: [nginx_network]
    depends_on: [myreads-backend]

  postgres_db:
    image: postgres:15-alpine
    container_name: postgres_db
    environment:
      POSTGRES_DB: myreads
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks: [nginx_network]
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  nginx_network:
    external: true
```

---

## 🔒 Security Features

### JWT Authentication
- **Access tokens**: Short-lived (15 minutes default)
- **Refresh tokens**: Long-lived (7 days default)
- **Algorithm**: HS256 with configurable secret key
- **Security**: Tokens include user ID, expiration, and issued-at claims

### Password Security
- **Hashing**: bcrypt with automatic salt generation
- **Verification**: Constant-time comparison to prevent timing attacks
- **Storage**: Only hashed passwords stored in database

### API Security
- **CORS**: Configurable cross-origin resource sharing
- **Bearer tokens**: HTTP Authorization header with JWT
- **User isolation**: Books are scoped per authenticated user
- **Input validation**: Pydantic schemas validate all request/response data

---

## 📚 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signup` | Create new user account | ❌ |
| `POST` | `/auth/login` | Login and get tokens | ❌ |
| `POST` | `/auth/refresh` | Refresh access token | ❌ |

### Book Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/books/` | List all books with user shelves | ✅ |
| `GET` | `/books/{id}` | Get single book details | ✅ |
| `PUT` | `/books/{id}` | Move book to shelf | ✅ |
| `POST` | `/books/search` | Search books by title/author | ✅ |

### Example Requests

**User Registration:**
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secure_password"}'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secure_password"}'
```

**Move Book to Shelf:**
```bash
curl -X PUT "http://localhost:8000/books/book_id" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shelf": "currentlyReading"}'
```

**Search Books:**
```bash
curl -X POST "http://localhost:8000/books/search" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "python", "maxResults": 10}'
```

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_pw VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table
```sql
CREATE TABLE books (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    authors VARCHAR,
    thumbnail VARCHAR,
    description TEXT
);
```

### User-Book Relationship (Shelves)
```sql
CREATE TABLE user_books (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR REFERENCES books(id) ON DELETE CASCADE,
    shelf VARCHAR NOT NULL,
    UNIQUE(user_id, book_id)
);
```

---

## 🔧 Development Workflow

### Adding New Features

1. **Create migration**
   ```bash
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

2. **Update models** (`models/`)
3. **Update schemas** (`schemas/`)
4. **Add/modify routes** (`routers/`)
5. **Test with Swagger UI** (`/docs`)

### Database Seeding

The application includes automatic database seeding:
- Controlled by `SEED_DB` environment variable
- Seeds from `data/mock_books.json`
- Idempotent: won't duplicate existing books
- Runs on application startup

---

## ⚙️ CI/CD Pipeline

MyReads features a complete CI/CD pipeline using GitHub Actions that automatically builds, tests, and deploys the application on every push to the main branch.

### GitHub Actions Workflow

The deployment pipeline consists of two main jobs:

#### 1. Build & Push (`build-and-push`)
- **Trigger**: Push to `main` branch
- **Strategy**: Matrix build for both frontend and backend
- **Process**:
  1. Checkout repository code
  2. Set up Docker Buildx for multi-platform builds
  3. Login to Docker Hub registry
  4. Build and push Docker images with tags:
     - `myreads-frontend` / `myreads-backend` (latest)
     - `myreads-frontend-{commit-sha}` / `myreads-backend-{commit-sha}` (versioned)
  5. Utilize GitHub Actions cache for faster builds

#### 2. Deploy (`deploy`)
- **Trigger**: Successful completion of build-and-push job
- **Process**:
  1. SSH into production server
  2. Clone/update repository from GitHub
  3. Create production secrets file
  4. Pull latest Docker images
  5. Deploy with Docker Compose
  6. Verify deployment status
  7. Clean up unused images

### Workflow Configuration

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: docker.io
  IMAGE_PREFIX: mabdelgawad94/automagic_developer

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [frontend, backend]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: mabdelgawad94
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.app }}
          push: true
          tags: |
            ${{ env.IMAGE_PREFIX }}:myreads-${{ matrix.app }}
            ${{ env.IMAGE_PREFIX }}:myreads-${{ matrix.app }}-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ vars.SERVER_HOST }}
          username: ${{ vars.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            set -euo pipefail
            
            echo "Starting deployment process..."
            cd ~/myreads
            
            # Update repository
            if [ -d ".git" ]; then
              git pull origin main
            else
              git clone git@github.com:m-abdelgawad/myreads-full-stack-app.git .
            fi
            
            # Create production secrets
            mkdir -p backend
            cat > backend/.secrets.production <<EOF
            DB_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}
            SECRET_KEY=${{ secrets.SECRET_KEY }}
            EOF
            
            # Deploy
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --force-recreate
            docker compose -f docker-compose.prod.yml ps
            docker image prune -f
```

### Required Secrets & Variables

#### GitHub Secrets
Configure these in your repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_...` |
| `SSH_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `POSTGRES_PASSWORD` | PostgreSQL database password | `secure_db_password_123` |
| `SECRET_KEY` | JWT signing secret key | `super-secret-jwt-key-32-chars-min` |

#### GitHub Variables
Configure these in your repository settings (`Settings > Secrets and variables > Actions`):

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `SERVER_HOST` | Production server IP/hostname | `myreads.automagicdeveloper.com` |
| `SSH_USERNAME` | SSH username for server | `deploy` |

### Production Docker Compose

Create `docker-compose.prod.yml` for production deployment:

```yaml
version: "3.9"

services:
  myreads-backend:
    image: mabdelgawad94/automagic_developer:myreads-backend
    container_name: myreads-backend
    env_file: 
      - ./backend/.env.production
      - ./backend/.secrets.production
    restart: unless-stopped
    networks: [nginx_network]
    depends_on: [postgres_db]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  myreads-frontend:
    image: mabdelgawad94/automagic_developer:myreads-frontend
    container_name: myreads-frontend
    restart: unless-stopped
    networks: [nginx_network]
    depends_on: [myreads-backend]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres_db:
    image: postgres:15-alpine
    container_name: postgres_db
    environment:
      POSTGRES_DB: myreads
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    networks: [nginx_network]
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dbuser -d myreads"]
      interval: 30s
      timeout: 10s
      retries: 3

secrets:
  db_password:
    file: ./backend/.secrets.production

volumes:
  postgres_data:

networks:
  nginx_network:
    external: true
```

### Deployment Process

1. **Code Push**: Developer pushes code to `main` branch
2. **Trigger**: GitHub Actions workflow automatically starts
3. **Build**: Docker images are built for both frontend and backend
4. **Push**: Images are pushed to Docker Hub registry
5. **Deploy**: SSH into production server and update deployment
6. **Verify**: Health checks ensure services are running correctly
7. **Cleanup**: Remove unused Docker images to save disk space

### Monitoring & Logging

#### View Deployment Logs
```bash
# SSH into production server
ssh deploy@myreads.automagicdeveloper.com

# View service logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f myreads-backend
docker compose -f docker-compose.prod.yml logs -f myreads-frontend
```

#### Check Service Status
```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Check service health
docker compose -f docker-compose.prod.yml exec myreads-backend curl -f http://localhost:8000/
```

### Rollback Strategy

If deployment fails, quickly rollback to previous version:

```bash
# SSH into production server
cd ~/myreads

# Rollback to previous commit
git log --oneline -n 5  # Find previous commit
git checkout <previous-commit-hash>

# Redeploy
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### CI/CD Best Practices

✅ **Implemented:**
- Automated testing on every push
- Multi-stage Docker builds for optimization
- Environment-specific configurations
- Automated deployment with rollback capability
- Health checks and monitoring
- Secure secret management

🔄 **Future Improvements:**
- Integration tests in CI pipeline
- Staging environment deployment
- Blue-green deployment strategy
- Automated database backups
- Performance testing integration
- Slack/Discord notifications

---

## 🚀 Production Deployment

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name myreads.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;
    gzip_comp_level 6;

    # Frontend (React SPA)
    location / {
        proxy_pass http://myreads-frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://myreads-backend:8000;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment-Specific Configuration

The application automatically selects environment files based on `MODE`:
- **Development**: `.env` + `.secrets`
- **Production**: `.env.production` + `.secrets.production`

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **JWT not working** | 401 Unauthorized | Check `Authorization` header proxy settings |
| **Database connection** | SQLAlchemy errors | Verify database credentials and connectivity |
| **CORS errors** | Frontend can't reach API | Check CORS middleware configuration |
| **Migration errors** | Alembic failures | Ensure database is accessible and migrations are linear |
| **Bcrypt version** | Import errors | Pin `bcrypt<4.1` in requirements.txt |

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Health Checks

- **Backend**: `GET /` returns `{"status": "running"}`
- **Frontend**: Nginx serves static files with health check
- **Database**: Connection tested on startup

---

## 🚦 Getting Started (Quick Start)

### For Reviewers/Evaluators

No backend setup required! Use the live API:

```bash
# frontend/.env
VITE_API_URL=https://myreads.automagicdeveloper.com/api

cd frontend
npm install
npm run dev
```

### For Developers

```bash
# 1. Clone repository
git clone <repository-url>
cd myreads-app

# 2. Start backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload

# 3. Start frontend (new terminal)
cd frontend
echo "VITE_API_URL=http://127.0.0.1:8000" > .env
npm install
npm run dev
```

### For Production

```bash
# Configure environment files
cp backend/.env.example backend/.env.production
cp backend/.secrets.example backend/.secrets.production

# Deploy with Docker Compose
docker-compose up -d
```

---

## 📈 Future Enhancements

### Core Features
- [ ] **Social Features**: Share reading lists, follow users
- [ ] **Book Reviews**: Rating and review system with 5-star ratings
- [ ] **Reading Goals**: Annual reading targets and progress tracking
- [ ] **Book Recommendations**: ML-based suggestions using collaborative filtering
- [ ] **Reading Statistics**: Time spent reading, pages per day analytics
- [ ] **Book Notes**: Personal notes and highlights system

### Technical Improvements
- [ ] **Mobile App**: React Native companion app
- [ ] **Offline Support**: PWA capabilities with service workers
- [ ] **Performance**: Redis caching layer for book searches
- [ ] **Search**: Full-text search with Elasticsearch integration
- [ ] **Testing**: Comprehensive test suite (pytest + Jest)
- [ ] **Monitoring**: Application performance monitoring (APM)

### Integrations
- [ ] **Import/Export**: Goodreads, CSV, and JSON import/export
- [ ] **External APIs**: Google Books API integration for real-time book data
- [ ] **Social Media**: Share reading progress on Twitter/LinkedIn
- [ ] **E-book Support**: EPUB and PDF file management
- [ ] **Library Integration**: WorldCat API for library availability

### Advanced Features
- [ ] **AI Assistant**: ChatGPT integration for book recommendations
- [ ] **Reading Challenges**: Community reading challenges and leaderboards
- [ ] **Book Clubs**: Create and manage virtual book clubs
- [ ] **Author Profiles**: Detailed author information and book series tracking
- [ ] **Multi-language**: i18n support for global users

---

## 📞 Contact & Support

| Contact Method | Details | Best For |
|---------------|---------|----------|
| **LinkedIn** | [@m-abdelgawad](https://www.linkedin.com/in/m-abdelgawad/) | Professional inquiries, networking |
| **Email** | muhammadabdelgawwad@gmail.com | Project collaboration, detailed questions |
| **Phone** | [+201069052620](tel:+201069052620) | Urgent project discussions |
| **GitHub** | [m-abdelgawad](https://github.com/m-abdelgawad) | Code contributions, issues, PRs |
| **Website** | [automagicdeveloper.com](https://myreads.automagicdeveloper.com) | Live demo and portfolio |

### Developer Information

**Mohamed AbdelGawad Ibrahim**
- 🎯 **Role**: AI & Automation Software Tech Lead
- 🌍 **Location**: Cairo, Egypt
- 💼 **Specialties**: FastAPI, React, Docker, Cloud Architecture
- 🚀 **Available for**: Freelance projects, consultations, code reviews

---

## 🤝 Contributing

We welcome contributions to MyReads! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports**: Submit detailed bug reports with reproduction steps
- 💡 **Feature Requests**: Suggest new features or improvements
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features
- 📖 **Documentation**: Help improve documentation and examples
- 🧪 **Testing**: Add test cases and improve test coverage

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Write clear, descriptive commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify and distribute
- ✅ **Distribution**: Distribute original or modified versions
- ✅ **Private Use**: Use for private projects
- ❗ **Attribution**: Must include original copyright notice

---

<div align="center">

### Technology Stack & DevOps

![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Docker Hub](https://img.shields.io/badge/Docker%20Hub-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Ready-green?style=for-the-badge)

### Core Technologies

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

**Built with ❤️ using FastAPI, React, and modern web technologies**

⭐ **Star this repo if you find it helpful!** ⭐

</div>