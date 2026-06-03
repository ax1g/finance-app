# FastAPI Finance App — Frontend

React SPA for personal finance tracking. Built with React 19, TypeScript 6, Vite 8, and Tailwind CSS v4.

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of financial health with key metrics |
| **Transaction Management** | Create, view, edit, and delete transactions |
| **Account Management** | Manage financial accounts (checking, savings, credit, etc.) |
| **Category Management** | Organize transactions by customizable categories |
| **Reports** | Aggregated financial summaries and visualizations |
| **Calendar View** | Chronological transaction browsing |
| **Authentication** | Login/signup with JWT-based session management |
| **Dark/Light Mode** | Full theme support with persistent preference |
| **Responsive Design** | Mobile-friendly layout with sidebar navigation |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript 6 | Type safety |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible component primitives |
| React Router v7 | Client-side routing |
| Lucide React | Icon library |
| Radix UI | Headless UI primitives |

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running at `http://127.0.0.1:8000`

### Setup

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api/v1` requests to the backend at `http://127.0.0.1:8000`.

### Build

```bash
npm run build
```

Produces an optimized build in `dist/`.

### Preview

```bash
npm run preview
```

Serve the production build locally.

### Lint

```bash
npm run lint
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server with HMR |
| `build` | `tsc -b && vite build` | Type-check and production build |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Lint source files |

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client modules (accounts, auth, categories, etc.)
│   ├── components/       # Shared UI components
│   │   └── ui/           # shadcn/ui primitives (button, card, input, etc.)
│   ├── context/          # React context providers (Auth, Modal, Theme)
│   ├── lib/              # Utility functions
│   ├── pages/            # Route page components
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Routes

| Path | Page | Access |
|------|------|--------|
| `/login` | Login | Public |
| `/` | Dashboard | Protected |
| `/transactions` | Transaction List | Protected |
| `/transactions/new` | Create Transaction | Protected |
| `/transactions/:txn_id` | Transaction Detail | Protected |
| `/accounts` | Account List | Protected |
| `/accounts/new` | Create Account | Protected |
| `/accounts/:account_id` | Account Detail | Protected |
| `/categories` | Category List | Protected |
| `/categories/new` | Create Category | Protected |
| `/categories/:category_id` | Category Detail | Protected |
| `/reports` | Reports | Protected |
| `/calendar` | Calendar View | Protected |
| `/settings` | Settings | Protected |

## Configuration

The development server proxies `/api/v1/*` requests to `http://127.0.0.1:8000` (configured in `vite.config.ts`). Update this target to point to your backend's address in production.
