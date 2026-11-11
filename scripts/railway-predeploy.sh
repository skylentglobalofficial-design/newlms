#!/usr/bin/env sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required for Prisma migrate deploy" >&2
  exit 1
fi

if [ -z "${DIRECT_URL:-}" ]; then
  DIRECT_URL="$DATABASE_URL"
  export DIRECT_URL
fi

pnpm exec prisma migrate deploy

if [ "${SKYLENT_RUN_SEED:-}" = "1" ]; then
  pnpm exec prisma db seed
fi
