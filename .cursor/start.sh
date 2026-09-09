#!/usr/bin/env bash
# Per-boot reconciliation: bring the local PostgreSQL server up and wait until
# it accepts connections. Safe to run repeatedly.
set -euo pipefail

PG_VER="$(ls /usr/lib/postgresql 2>/dev/null | sort -n | tail -n1 || true)"
if [ -z "${PG_VER}" ]; then
  echo "PostgreSQL is not installed" >&2
  exit 1
fi

# Ensure the default cluster exists (the package normally creates it on install).
if [ ! -d "/etc/postgresql/${PG_VER}/main" ]; then
  sudo pg_createcluster "${PG_VER}" main
fi

# Start the cluster only when it is not already running.
if ! sudo pg_ctlcluster "${PG_VER}" main status >/dev/null 2>&1; then
  sudo pg_ctlcluster "${PG_VER}" main start
fi

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    echo "PostgreSQL ${PG_VER} is ready"
    exit 0
  fi
  sleep 1
done

echo "PostgreSQL ${PG_VER} did not become ready in time" >&2
exit 1
