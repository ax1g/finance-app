FROM python:3.14-slim-bookworm AS builder

WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock ./

RUN pip install uv && uv sync --no-dev --frozen

FROM python:3.14-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

COPY backend/alembic.ini .
COPY backend/alembic/ ./alembic/
COPY backend/app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
