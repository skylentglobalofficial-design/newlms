#!/usr/bin/env bash
# Idempotent repository bootstrap: PostgreSQL role/database, local env file,
# Node dependencies, schema migrations, and seed data.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

# 1. Ensure PostgreSQL is running so we can migrate and seed.
bash "${ROOT}/.cursor/start.sh"

# 2. Ensure the application role and database exist.
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='newlms'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE ROLE newlms LOGIN PASSWORD 'newlms' CREATEDB;"
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='newlms'" | grep -q 1; then
  sudo -u postgres createdb -O newlms newlms
fi

# 3. Create the gitignored local dev env file when it is missing.
if [ ! -f "${ROOT}/.env" ]; then
  SECRET="$(node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))")"
  cat > "${ROOT}/.env" <<EOF
# Local development environment (Cloud Agent). Not committed.
DATABASE_URL=postgresql://newlms:newlms@localhost:5432/newlms?schema=public
DIRECT_URL=postgresql://newlms:newlms@localhost:5432/newlms?schema=public
SESSION_SECRET=${SECRET}
COOKIE_SECURE=false
FRONTEND_URL=http://localhost:5173
VITE_DEMO_MODE=true
EOF
fi

# 4. Install dependencies (postinstall generates the Prisma client).
npm ci

# 5. Apply schema and seed reference data (both idempotent).
set -a
# shellcheck disable=SC1091
. "${ROOT}/.env"
set +a
npx prisma migrate deploy
npm run db:seed
