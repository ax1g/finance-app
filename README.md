# Neco

A minimalist personal finance manager — track income, expenses, and account balances with a clean FastAPI + React stack.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Radix UI |
| **Backend** | Python 3.14+, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| **Database** | PostgreSQL 17 |
| **Auth** | JWT (PyJWT, HS256) + Argon2 password hashing |
| **Infrastructure** | Docker, Docker Compose, Nginx |

## Architecture

```
┌─────────┐     ┌──────────┐     ┌────────────┐
│  Nginx  │────▶│  FastAPI │────▶│ PostgreSQL │
│ (Proxy) │     │ (REST)   │     │            │
└─────────┘     └──────────┘     └────────────┘
       ▲
       │
┌──────┴──────┐
│  React SPA  │
│  (Vite)     │
└─────────────┘
```

Backend follows a domain-driven structure: each module (`accounts/`, `categories/`, `transactions/`, `users/`, `reports/`) contains its own route, service, repository, model, and schema.

## Prerequisites

- **Local dev**: Python 3.14+, Node.js 22+, PostgreSQL 17+, [uv](https://docs.astral.sh/uv/)
- **Docker**: Docker 24+ & Docker Compose v2+

## Quick Start

```bash
# 1. Clone and enter
git clone <repo-url> && cd neco

# 2. Run setup (copies .env.example → .env, installs deps)
./setup.sh

# 3. Start the backend (auto-runs migrations)
cd backend && fastapi dev

# 4. In another terminal, start the frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api/v1` → `:8000`)
- API docs: http://localhost:8000/docs

## Docker

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# Stop
docker compose down

# Reset database (destroys volume)
docker compose down -v && docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| OpenAPI | http://localhost:8000/docs |

Migrations run automatically on backend startup. The frontend Nginx proxies `/api/v1` to the backend.

## Local Development

### Backend

```bash
cd backend

# Install / sync dependencies
uv sync

# Run development server (auto-reload + auto-migrations)
fastapi dev

# Run with explicit host/port
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run migrations manually
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (HMR at :5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Backend (ruff)
cd backend && uv run ruff check . && uv run ruff format --check .

# Frontend (ESLint)
cd frontend && npm run lint
```

### Testing

```bash
cd backend && uv run pytest
```

## Environment Variables

Key variables in `.env` (see `.env.example` for all):

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `changethis` | JWT signing secret (change in production) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT token lifetime |
| `POSTGRES_SERVER` | `localhost` | Database host |
| `POSTGRES_DB` | `neco_db` | Database name |
| `ENVIRONMENT` | `local` | `local`, `staging`, or `production` |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, lifespan, exception handlers
│   │   ├── core/                    # Config, DB, security, exceptions, base model
│   │   ├── api/v1/                  # Route aggregator
│   │   ├── accounts/                # Route → service → repo → model → schema
│   │   ├── categories/              # Same pattern + default categories
│   │   ├── transactions/            # Same pattern
│   │   ├── users/                   # Same pattern + auth + token management
│   │   └── reports/                 # Aggregation queries & dashboard data
│   ├── alembic/                     # Database migrations
│   ├── tests/
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/                   # 14 lazy-loaded route pages
│   │   ├── components/              # Layout, Sidebar, Modals, UI primitives
│   │   ├── context/                 # Auth, Theme, Modal, Toast, DataRefresh
│   │   ├── api/                     # Fetch wrappers per domain
│   │   └── types/                   # TypeScript interfaces
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── setup.sh
├── .env.example
└── .pre-commit-config.yaml
```

## API Overview

Base path: `/api/v1`

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/signup`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **Transactions** | `GET /transactions/`, `POST /transactions/`, `GET/PATCH/DELETE /transactions/{id}` |
| **Accounts** | `GET /accounts/`, `POST /accounts/`, `GET/PATCH/DELETE /accounts/{id}` |
| **Categories** | `GET /categories/`, `POST /categories/`, `PATCH /categories/{id}` |
| **Reports** | `GET /reports/dashboard`, `GET /reports/spending-by-category`, `GET /reports/monthly-summary`, `GET /reports/income-statement` |
| **User** | `GET /user/me`, `PATCH /user/me`, `POST /user/change-password` |

## Contributing

### Pre-commit

```bash
pip install pre-commit && pre-commit install
```

Runs `ruff --fix` on every commit.

### Convention Notes

- Backend: domain modules follow `route → service → repository → model → schema`
- Frontend: API functions live in `src/api/` matching backend domain names
- Colors: use `--color-income` and `--color-expense` CSS variables — never hardcode hex
- Numbers: `font-number` class (JetBrains Mono) + `fmt()` currency formatter
- Modals: stack-based via `ModalContext` — supports nested modals
- No external state library — 5 React Contexts (Auth, Theme, Modal, Toast, DataRefresh)
