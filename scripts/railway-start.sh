#!/usr/bin/env sh
set -eu

export NODE_ENV="${NODE_ENV:-production}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required in production" >&2
  exit 1
fi

if [ -z "${DIRECT_URL:-}" ]; then
  DIRECT_URL="$DATABASE_URL"
  export DIRECT_URL
fi

if [ -z "${SESSION_SECRET:-}" ]; then
  echo "SESSION_SECRET is required in production" >&2
  exit 1
fi

if [ -z "${FRONTEND_URL:-}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
  FRONTEND_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
  export FRONTEND_URL
fi

if [ -z "${CORS_ALLOWED_ORIGINS:-}" ] && [ -n "${FRONTEND_URL:-}" ]; then
  CORS_ALLOWED_ORIGINS="$FRONTEND_URL"
  export CORS_ALLOWED_ORIGINS
fi

exec node server/dist/index.js
