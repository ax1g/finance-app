# FastAPI Finance App — Backend

REST API for personal finance tracking. Built with FastAPI, SQLAlchemy 2.0 async, and PostgreSQL.

## Features

| Feature | Description |
|---------|-------------|
| **Async API** | Fully asynchronous CRUD endpoints with FastAPI |
| **Domain-Driven Design** | Separated modules for accounts, categories, transactions, users, and reports |
| **JWT Authentication** | Secure bearer token auth via PyJWT with Argon2 password hashing |
| **Database Migrations** | Alembic-managed schema versioning |
| **Input Validation** | Pydantic v2 models for request/response validation |
| **Soft Delete** | Support for soft-deleting accounts and categories |
| **Reporting** | Aggregated financial reports |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Python 3.14 | Runtime |
| FastAPI ^0.136 | Web framework |
| SQLAlchemy 2.0 | Async ORM |
| PostgreSQL | Database |
| Alembic | Schema migrations |
| Pydantic v2 | Data validation |
| PyJWT | JWT auth tokens |
| Argon2 (pwdlib) | Password hashing |
| Uvicorn | ASGI server |
| Ruff | Linting & formatting |
| Pytest | Testing |

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # Route registration
│   ├── core/            # Config, database, security, dependencies
│   ├── accounts/        # Domain: accounts (model, repo, service, schema, routes)
│   ├── categories/      # Domain: categories
│   ├── transactions/    # Domain: transactions
│   ├── users/           # Domain: users + auth
│   └── reports/         # Domain: reports
├── alembic/             # Migration scripts
├── tests/               # Test suite
└── pyproject.toml       # Dependencies & tooling config
```

## Quick Start

### Prerequisites

- Python 3.14+
- PostgreSQL running locally
- [uv](https://docs.astral.sh/uv/) package manager

### Setup

```bash
# Clone and enter backend
cd backend

# Install dependencies
uv install

# Create .env in the project root (one level above backend/)
# See .env.example for all options
cat > ../.env <<EOF
PROJECT_NAME="FastAPI Finance App"
API_V1_STR="/api/v1"
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=finance_db
EOF

# Run migrations
alembic upgrade head

# Seed sample data (optional)
uv run python -m app.seed
```

### Run

```bash
uv run uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000` with interactive docs at `/api/v1/openapi.json`.

## API Endpoints

Base path: `/api/v1`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create a new user |
| POST | `/auth/login` | Authenticate and receive a bearer token |
| GET | `/auth/me` | Get current user from token |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions/` | List transactions (`limit`, `offset`, `start`, `end`, `txn_type`) |
| GET | `/transactions/{txn_id}` | Get transaction by UUID |
| POST | `/transactions/` | Create a transaction |
| PATCH | `/transactions/{txn_id}` | Update a transaction |
| DELETE | `/transactions/{txn_id}` | Delete a transaction |

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts/` | List accounts |
| GET | `/accounts/{account_id}` | Get account by UUID |
| POST | `/accounts/` | Create an account |
| PATCH | `/accounts/{account_id}` | Update an account |
| DELETE | `/accounts/{account_id}` | Delete an account |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories/` | List categories (`category_type`) |
| POST | `/categories/` | Create a category |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/` | Generate financial reports |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/` | List users |
| GET | `/user/me` | Get current authenticated user |
| GET | `/user/{user_id}` | Get user by UUID |

## Production Notes

- Set `echo=False` in `app/core/database.py` to disable SQL logging
- Configure connection pooling (`pool_size`, `max_overflow`) for production load
- Use a proper secrets manager for `SECRET_KEY` and database credentials
- See `AGENTS.md` for detailed development conventions and best practices
