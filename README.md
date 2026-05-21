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

## Notes

- Backend-specific setup and usage details are available in `backend/README.md`.
- The repository currently focuses on backend wiring and API implementation.
