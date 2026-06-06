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

## UI Design Principles (AI must follow strictly)

This project uses **shadcn/ui (new-york style)** with Tailwind CSS v4. Every UI decision must align with shadcn's design language — clean, minimal, functional, accessible.

### Layout & Spacing
- Use `space-y-6` for top-level page sections, `space-y-4` for card content groups, `gap-3`/`gap-4` for grid layouts
- Cards use `p-6` for padding (via `CardHeader`/`CardContent`). Never add extra padding directly on the `Card` div.
- Lists inside cards use `p-0` on `CardContent` with `px-6` on items so they bleed edge-to-edge
- Item padding: `py-2.5` for compact lists, `py-3` for standard density, `px-6` to align with card edges
- Dividers between list items: use `border-b border-border`, never per-item borders
- Keep interactive density reasonable — don't waste space but don't crowd

### Cards
- `Card` = `rounded-xl bg-card text-card-foreground shadow-sm` (no visible `border`)
- Cards exist as subtle elevation layers — `bg-card` is slightly off-white in light mode to separate from page background
- `CardHeader` = heading area (`p-6 pb-3` to tighten), `CardTitle` = `font-semibold leading-none tracking-tight`
- `CardContent` = `p-6 pt-0` (standard), or `p-0` when containing a flush list
- Use `pb-3` on `CardHeader` when you want a tighter header-to-content gap

### Colors
- **Never hardcode hex colors**. All colors come from CSS variables: `var(--color-income)` (teal), `var(--color-expense)` (rose), `var(--chart-1)` through `var(--chart-5)` for charts
- Use opacity modifiers for backgrounds: `bg-[var(--color-income)]/10`, never define new custom colors
- Semantic colors: `text-muted-foreground` for secondary text, `text-foreground` for primary, `text-destructive` for errors
- Border colors: always `border-border` or `border-border/50` for more subtle

### Typography
- System sans-serif for everything — no serif fonts
- `font-number` class (JetBrains Mono) for all monetary amounts
- `font-medium` for emphasis, `font-semibold` for headings, never `font-bold` except for display text
- `tracking-tight` on large numbers and headings
- Line heights: `leading-none` for single-line items, `leading-snug` for readable paragraphs
- Text sizes: `text-xs` for metadata/labels, `text-sm` for body, `text-2xl`/`text-4xl` for values

### Lists & Interactive Items
- List rows: no border or background by default; add `hover:bg-muted/50` for interactivity
- Use `border-b border-border` between items only, never wrap each item in a border card
- Icons in lists: `h-7 w-7 rounded-full` with `h-3.5 w-3.5` icons, color-coded backgrounds
- Truncate overflowing text with `truncate` or `min-w-0` on flex children
- Amounts align right, description left

### Focus & Keyboard
- Every interactive element must have `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`
- Use `focus-visible:ring-inset` for items flush with card edges
- Tab order should follow visual layout — sidebar nav first, then main content

### Animations
- Subtle only: `animate-fade-in` (0.5s ease-out) for entrance, `transition-colors`/`transition-all` for interactions
- Count-up animations limited to 800ms, max 30 steps
- No framer-motion or heavy animation libraries — pure CSS

### Dark Mode
- Dark mode enabled via `.dark` class on `<html>`. Always test both themes.
- Dark card backgrounds (`oklch(0.185 0 0)`) are slightly lighter than page background (`oklch(0.145 0 0)`) to create elevation
- Use `dark:` variants sparingly — most colors come from CSS variables that switch automatically
- Inputs in dark mode: `dark:bg-input/30` for subtle fill
