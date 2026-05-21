# FastAPI Finance App — Backend

This directory contains the backend service for the FastAPI Finance App. It provides a REST API to manage transactions and includes database models, migrations, and business logic.

## Features

- Async FastAPI endpoints for transaction CRUD
- Async SQLAlchemy models and repository layer
- Pydantic validation and response models
- Alembic migrations for schema management

## Requirements

- Python 3.14+
- PostgreSQL database
- `uv` as the recommended Python environment manager

## Setup

1. Create and activate a Python environment using `uv`.
2. Install project dependencies from the `backend` folder using `uv`:

```bash
cd backend
uv install
```

3. Create a `.env` file one level above `backend/` with the following values:

```ini
PROJECT_NAME="FastAPI Finance App"
API_V1_STR="/api/v1"
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=finance_db
```

4. Initialize the database schema using Alembic:

```bash
cd backend
alembic upgrade head
```

## Running the backend

Start the application through `uv` to ensure the managed environment is used:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000` and the OpenAPI docs at `http://127.0.0.1:8000/api/v1/openapi.json`.

## Seed sample data

Use the project's seed module to populate sample transactions (run inside the managed environment):

```bash
cd backend
uv run python -m app.seed
```

## API Endpoints

Base path: `/api/v1/transactions`

- `GET /` — list transactions with optional pagination and date-range filters
- `GET /{txn_id}` — retrieve a single transaction
- `POST /` — create a new transaction
- `PATCH /{txn_id}` — update an existing transaction
- `DELETE /{txn_id}` — delete a transaction

## Notes

- For production deployment, set `echo=False` in `backend/app/core/db.py` and configure connection pooling appropriately.
- See the repository root `README.md` for a high-level overview.