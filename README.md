# Neco

A minimalist personal finance app to manage your Neo Coins.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, TypeScript 6, Vite 8 | SPA with component-based UI |
| **Styling** | Tailwind CSS v4, shadcn/ui | Utility-first styling + accessible primitives |
| **Backend** | Python 3.14, FastAPI ^0.136 | Async REST API |
| **Database** | PostgreSQL, SQLAlchemy 2.0 async | Data persistence & ORM |
| **Auth** | PyJWT, Argon2 (pwdlib) | JWT tokens & password hashing |
| **Migrations** | Alembic | Schema versioning |
| **Infrastructure** | Docker, Docker Compose | Containerization & orchestration |

## Project Structure

```
├── backend/          # FastAPI REST API
│   ├── app/          # Domain modules (accounts, categories, transactions, users, reports)
│   ├── alembic/      # Database migrations
│   └── tests/        # Test suite
├── frontend/         # React SPA
│   └── src/          # Pages, components, API client, context providers
├── docker-compose.yml
└── .env.example
```

## Quick Start

### Prerequisites

- Python 3.14+, PostgreSQL, [uv](https://docs.astral.sh/uv/) (local dev)
- or Docker & Docker Compose

### Local Development

```bash
# Backend
cd backend
uv install
alembic upgrade head
uv run uvicorn app.main:app --reload     # → http://localhost:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                               # → http://localhost:5173
```

### Docker

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| OpenAPI Docs | http://localhost:8000/api/v1/openapi.json |

Migrations run automatically on backend startup. The frontend Nginx proxies `/api/v1` to the backend container.

## API Overview

Base path: `/api/v1`

| Resource | Key Endpoints |
|----------|--------------|
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Transactions | `GET/POST /transactions/`, `GET/PATCH/DELETE /transactions/{id}` |
| Accounts | `GET/POST /accounts/`, `GET/PATCH/DELETE /accounts/{id}` |
| Categories | `GET/POST /categories/` |
| Reports | `GET /reports/` |
| Users | `GET /user/`, `GET /user/me`, `GET /user/{id}` |

## Documentation

- **Backend**: `backend/README.md` — setup, API endpoints, configuration
- **Frontend**: `frontend/README.md` — setup, routes, scripts
- **Agents**: `backend/AGENTS.md` — development conventions for AI coding agents
