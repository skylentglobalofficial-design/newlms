#!/usr/bin/env bash
#
# Per-boot startup for the Skylent LMS Cloud Agent environment.
# Ensures PostgreSQL is running and ready before the dev servers launch.
set -euo pipefail

PG_VERSION="${PG_VERSION:-16}"
PGBIN="/usr/lib/postgresql/${PG_VERSION}/bin"
PGDATA="${PGDATA:-$HOME/pgdata}"
PGPORT="${PGPORT:-5432}"
export PATH="${PGBIN}:${PATH}"

if ! pg_ctl -D "${PGDATA}" status >/dev/null 2>&1; then
  echo "==> Starting PostgreSQL on port ${PGPORT}"
  pg_ctl -D "${PGDATA}" -l "${HOME}/pg.log" -o "-p ${PGPORT} -k /tmp" -w start
fi

for _ in $(seq 1 30); do
  if pg_isready -h 127.0.0.1 -p "${PGPORT}" >/dev/null 2>&1; then
    echo "==> PostgreSQL is ready on port ${PGPORT}"
    exit 0
  fi
  sleep 1
done

echo "PostgreSQL did not become ready on port ${PGPORT}" >&2
exit 1
