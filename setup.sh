#!/usr/bin/env bash
set -euo pipefail

echo "=== Copying .env.example -> .env ==="
cp -n .env.example .env 2>/dev/null || echo ".env already exists, skipping"

echo "=== Installing backend dependencies ==="
cd backend
uv sync
cd ..

echo "=== Installing frontend dependencies ==="
cd frontend
npm install
cd ..

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start the dev servers, run:"
echo ""
echo "  step 1: source .venv/bin/activate"
echo "  step 2: cd backend && fastapi dev"
echo "  step 3: cd frontend && npm run dev"
echo ""
echo "Enjoy!"
