# FastAPI Finance App

A finance tracking application with a FastAPI backend and a React frontend.

## Repository structure

- `backend/` — FastAPI service, SQLAlchemy models, Alembic migrations, and backend business logic
- `frontend/` — React application for the user interface

## Backend

The backend is implemented using:

- FastAPI for API routing
- SQLAlchemy async ORM for database access
- PostgreSQL as the primary datastore
- Pydantic for request/response validation
- Alembic for database migrations

## Quick start

1. Create or activate a Python virtual environment.
2. Install backend dependencies from the `backend/` folder.
3. Create a `.env` file one level above `backend/` with database and app settings.
4. Run Alembic migrations to create the schema.
5. Start the backend with Uvicorn.

## Documentation

The backend exposes OpenAPI documentation once started. Visit the URL shown by Uvicorn or use:

- `http://127.0.0.1:8000/api/v1/openapi.json`

## API Endpoints

Base path: `/api/v1`

### Transactions

- `GET /api/v1/transactions/` — list transactions; optional query params: `limit`, `offset`, `start`, `end`, `txn_type`
- `GET /api/v1/transactions/{txn_id}` — retrieve a single transaction by UUID
- `POST /api/v1/transactions/` — create a new transaction
- `PATCH /api/v1/transactions/{txn_id}` — update an existing transaction
- `DELETE /api/v1/transactions/{txn_id}` — delete a transaction

### Accounts

- `GET /api/v1/accounts/` — list accounts
- `GET /api/v1/accounts/{account_id}` — retrieve an account by UUID
- `POST /api/v1/accounts/` — create a new account
- `PATCH /api/v1/accounts/{account_id}` — update an existing account
- `DELETE /api/v1/accounts/{account_id}` — delete an account

### Categories

- `GET /api/v1/categories/` — list categories; optional query param: `category_type`
- `POST /api/v1/categories/` — create a new category

### Users

- `GET /api/v1/user/` — list users
- `GET /api/v1/user/{user_id}` — retrieve a user by UUID
- `GET /api/v1/user/me` — retrieve the currently authenticated user

### Security / Auth

- `POST /api/v1/auth/login` — authenticate with OAuth2 password form and receive a bearer token
- `POST /api/v1/auth/signup` — create a new user
- `GET /api/v1/auth/me` — retrieve current user details from the token

## Notes

- Backend-specific setup and usage details are available in `backend/README.md`.
- The repository currently focuses on backend wiring and API implementation.
