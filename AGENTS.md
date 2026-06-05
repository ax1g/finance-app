# Neco App — AI Context

Personal finance manager: FastAPI + React (TypeScript), PostgreSQL.

## Quick Start

```bash
docker compose up        # full stack
# or individually:
cd backend  && uv run fastapi dev       # :8000
cd frontend && npm run dev              # :5173 (proxies /api/v1 -> :8000)
```

## Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.13+, FastAPI, SQLAlchemy (async), Alembic, PostgreSQL 17 |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4, Radix UI, Lucide icons |
| Auth | JWT (PyJWT, HS256, 60min expiry) + argon2 password hashing |
| State | React Context (4 contexts: Auth, Theme, Modal, Toast) — no external state lib |
| Package | Backend: uv workspaces / pyproject.toml. Frontend: npm / package.json |

## Backend Structure

Each domain is a module under `backend/app/` following `route → service → repository → model → schema`:

```
accounts/  categories/  transactions/  users/  reports/  core/  api/v1/
```

- **Dependency injection**: Fastify `Depends()` — `CurrentUserDep` resolves JWT, `get_db` provides async session
- **Exception hierarchy**: `AppError` → `AuthError`, `NotFoundError`, `ConflictError`, `RepositoryError` — each maps to an HTTP status in `main.py` global handlers
- **All authenticated routes** require `CurrentUserDep`

## Frontend Structure

```
pages/     — 13 page components (lazy-loaded via React Router)
components/ — Layout, Sidebar, ErrorBoundary, Modals, ui/ primitives
context/   — Auth, Theme, Modal, Toast providers
api/       — fetch wrappers per domain (client.ts manages JWT)
types/     — TypeScript interfaces matching backend Pydantic schemas
```

- **Data fetching**: `useEffect` + `useState` + api functions directly (no React Query)
- **Routing**: `react-router-dom` v7, `<Layout />` wraps all auth-gated routes

## Conventions

- **Colors**: `--color-income` (green `#16a34a`) and `--color-expense` (red `#dc2626`) — use CSS variables, never hardcode hex
- **Numbers**: `font-number` class (JetBrains Mono) + `fmt()` currency formatter
- **Styling**: Tailwind utility classes, `cn()` from `@/lib/utils` for conditional merging
- **No comments in code** — keep it clean
- **API client pattern**: `apiFetch(path, options)` in `client.ts` — auto-attaches JWT, handles 401

## Key Implementation Details

- **Transaction types**: `income`, `expense`, `adjustment`, `transfer`
- **Account types**: `cash`, `bank`, `investment`, `receivables`, `payables`
- **Signup seeds 36 default categories** (8 income + 27 expense + 1 "Opening Balance")
- **Adjustments are system-only**: Users cannot create them via the API. When an account is created with an `opening_balance > 0`, the system auto-creates an `adjustment` transaction linked to the "Opening Balance" category. Editing an adjustment recalculates the account balance (delta applied). Deleting an adjustment subtracts its amount from the account balance.
- **Dashboard reports are mocked** in `frontend/src/api/dashboard.ts` — real data at `/reports/dashboard`
- **Modals use a stack** — `ModalContext` supports nested modals (e.g. quick-create inside transaction form)

## Creating/Editing Pages

The only path to create a transaction is clicking "+" in the sidebar → opens `TransactionFormModal` (modal component). The `/transactions/new` route and `TransactionCreate` page have been removed.

## Current Issues

- Dashboard uses hardcoded mock data instead of calling the real API
- `/reports/dashboard` endpoint exists but `dashboard.ts` ignores it
- `TransactionDetail.tsx` had a TDZ bug (editForm used before useState) — now fixed
