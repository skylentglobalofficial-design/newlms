#!/usr/bin/env bash
# Long-running dev processes: Vite frontend (5173) + Express API (3000).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

set -a
# shellcheck disable=SC1091
[ -f "${ROOT}/.env" ] && . "${ROOT}/.env"
set +a

exec npm run dev:all
