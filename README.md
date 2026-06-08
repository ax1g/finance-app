<div align="center">
  <h1>Neco</h1>
  <p><strong>A minimalist personal finance manager</strong></p>
  <p>
    <a href="https://neco-money.vercel.app">Live Demo →</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
    <img src="https://img.shields.io/badge/python-3.14+-blue" alt="Python">
    <img src="https://img.shields.io/badge/react-19-61DAFB" alt="React">
  </p>
</div>

Track income, expenses, and account balances with a clean FastAPI + React stack. Includes monthly income statements, spending breakdowns, calendar view, and PWA support for mobile install.

## Screenshots

| Dashboard | Reports | Transactions |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Reports](screenshots/reports.png) | ![Transactions](screenshots/transactions.png) |

| Accounts | Monthly Statement | Categories |
|---|---|---|
| ![Accounts](screenshots/accounts.png) | ![Statement](screenshots/statement.png) | ![Categories](screenshots/categories.png) |

## Features

- **Dashboard** — net worth, income/expense summary, monthly trends bar chart
- **Transactions** — filterable list with calendar view, create/edit/delete
- **Reports** — income statement by month, spending breakdown, account summary, CSV export
- **Accounts** — multi-type (cash, bank, investment, receivables, payables) with opening balances
- **Categories** — income/expense with emoji icons, inline editing, multi-select delete
- **Authentication** — JWT-based signup/login, password reset flow
- **PWA** — installable on mobile with offline-capable service worker
- **Responsive** — sidebar on desktop, bottom nav with FAB on mobile

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, Recharts |
| **Backend** | Python 3.14+, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| **Database** | PostgreSQL 17 |
| **Auth** | JWT (PyJWT) + Argon2 password hashing |
| **Infrastructure** | Vercel (frontend), FastAPI Cloud (backend), Docker |

## Quick Start

```bash
# Clone and enter
git clone https://github.com/ax1g/neco.git && cd neco

# Run setup (copies .env, installs deps)
./setup.sh

# Start backend (auto-runs migrations)
cd backend && fastapi dev

# In another terminal, start frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api/v1` → `:8000`)
- API docs: http://localhost:8000/docs

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `changethis` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT lifetime |
| `POSTGRES_SERVER` | `localhost` | Database host |
| `POSTGRES_DB` | `neco_db` | Database name |
| `ENVIRONMENT` | `local` | `local`, `staging`, or `production` |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, lifespan, exception handlers
│   │   ├── core/                   # Config, DB, security, exceptions, base model
│   │   ├── api/v1/                 # Route aggregator
│   │   ├── accounts/               # Route → service → repo → model → schema
│   │   ├── categories/             # Same pattern + default categories
│   │   ├── transactions/           # Same pattern
│   │   ├── users/                  # Same pattern + auth + token management
│   │   └── reports/                # Aggregation queries & dashboard data
│   ├── alembic/                    # Database migrations
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Route pages
│   │   ├── components/             # Layout, modals, UI primitives
│   │   ├── context/                # Auth, Theme, Modal, Toast, DataRefresh
│   │   ├── api/                    # Fetch wrappers per domain
│   │   └── types/                  # TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
├── setup.sh
└── .env.example
```

## API Overview

Base path: `/api/v1`

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |
| **Transactions** | `GET/POST /transactions/`, `GET/PATCH/DELETE /transactions/{id}` |
| **Accounts** | `GET/POST /accounts/`, `GET/PATCH/DELETE /accounts/{id}` |
| **Categories** | `GET/POST /categories/`, `PATCH /categories/{id}` |
| **Reports** | `GET /reports/dashboard`, `/reports/spending-by-category`, `/reports/monthly-summary`, `/reports/income-statement` |
| **User** | `GET/PATCH /user/me`, `POST /user/change-password` |

## Development

### Backend

```bash
cd backend
uv sync                       # Install dependencies
fastapi dev                   # Dev server with auto-reload
uv run ruff check .           # Lint
uv run pytest                 # Run tests
alembic upgrade head          # Run migrations
alembic revision --autogenerate -m "desc"  # Create migration
```

### Frontend

```bash
cd frontend
npm install                   # Install dependencies
npm run dev                   # Dev server with HMR
npm run build                 # Production build
npm run lint                  # Lint
```

## Docker

```bash
docker compose up --build     # Build and start
docker compose down           # Stop
docker compose down -v        # Reset database
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| OpenAPI docs | http://localhost:8000/docs |

## Contributing

1. Install pre-commit: `pip install pre-commit && pre-commit install`
2. Follow domain-driven structure for backend changes
3. Use `--color-income` / `--color-expense` CSS variables, never hardcode hex
4. Use the `fmt()` currency formatter and `font-number` class for monetary values
