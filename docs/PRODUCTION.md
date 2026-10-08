# Skylent production runbook

This is the current merged student product (catalogue, LMS, Labs, Career OS, Skylent AI chrome). It is a single Node.js process that serves the Vite client from `dist/` and the Express API from `/api/v1`.

Do not commit secrets. Do not point DNS until credentials and a Postgres database exist.

## 1. Required infrastructure

- Node.js 22
- PostgreSQL 15+ (persistent). Prisma needs both a runtime URL and a direct/migrate URL.
- A host that can run `pnpm run build`, `prisma migrate deploy`, then `node server/dist/index.js` (Railway config is included; any equivalent host works).
- HTTPS in front of the app so session cookies can be `Secure`.

Optional:

- OpenAI-compatible API for Skylent AI (the rest of the product works if this is unset; the lesson assistant shows as unavailable).
- Google OAuth client for “Continue with Google”.
- Object storage for assignment file bytes (today only metadata is stored with `storageProvider: pending`).

## 2. Environment variables

### Required in production

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma runtime connection (pooled URL is fine). |
| `DIRECT_URL` | Prisma migrate/direct connection. If unset, start scripts copy `DATABASE_URL`. |
| `SESSION_SECRET` | HMAC secret for Google OAuth state. ≥32 characters. Generate with `openssl rand -base64 48`. |
| `FRONTEND_URL` | Public origin of this app, including scheme, no trailing slash. Used for CORS and OAuth redirects. |
| `NODE_ENV` | Must be `production` for static SPA serving, secure cookies, and env checks. |
| `PORT` | Listen port. The host usually injects this. |

### Optional

| Variable | Purpose |
| --- | --- |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins. Defaults to `FRONTEND_URL`. |
| `COOKIE_SECURE` | `true`/`false`. Default in production is secure cookies. Set `false` only for local HTTP production-build tests. |
| `TRUST_PROXY` | Hop count for `X-Forwarded-*` (default `1` in production). |
| `AUTH_RATE_LIMIT_WINDOW_MS` / `AUTH_RATE_LIMIT_MAX` | Login/signup limiter (default 20 / 15 minutes). |
| `JSON_BODY_LIMIT` | Default `512kb`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth. Redirect URI must be `{FRONTEND_URL}/api/v1/auth/google/callback`. |
| `SKYLENT_AI_PROVIDER` | `openai-compatible` (production), `off`, or unset. |
| `SKYLENT_AI_API_KEY` | Server-side only. Never use a `VITE_` prefix. |
| `SKYLENT_AI_BASE_URL` | Default `https://api.openai.com/v1`. |
| `SKYLENT_AI_MODEL` | Default `gpt-4o-mini`. |
| `SKYLENT_AI_TIMEOUT_MS` / `SKYLENT_AI_MAX_OUTPUT_TOKENS` | Provider limits. |
| `SKYLENT_AI_RATE_LIMIT_WINDOW_MS` / `SKYLENT_AI_RATE_LIMIT_MAX` | Assistant limiter (default 40 / 15 minutes). |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` / `SUPERADMIN_NAME` | First-admin bootstrap only (`pnpm bootstrap:superadmin`). Password ≥12 characters, only when creating the account. |
| `SKYLENT_RUN_SEED` | Set to `1` on **first** deploy only so predeploy loads catalog. |
| `SKYLENT_ALLOW_DESTRUCTIVE_SEED` | Required to re-run seed after catalog exists. Re-seeding deletes curriculum nodes and **learner progress**. |
| `SKYLENT_AI_ALLOW_GROUNDED` | Do not set in production. Allows the preview `lesson-grounded` provider. |

### Development only

| Variable | Purpose |
| --- | --- |
| `VITE_DEMO_MODE` | Login workspace picker. Committed `.env.production` forces `false`. |
| Localhost CORS ports | Added automatically when `NODE_ENV` is not `production`. |

### Test only

| Variable | Purpose |
| --- | --- |
| `API_BASE` | Integration scripts (default `http://localhost:3000/api/v1`). |
| `SKYLENT_AI_LIVE_SMOKE` | Opt-in live vendor smoke. Never treat `lesson-grounded` as a live vendor. |
| `AUTH_RATE_LIMIT_MAX` / `SKYLENT_LABS_RATE_LIMIT_MAX` | Raised in `pnpm test:integration`. |

`COOKIE_SECURE=false` is required for an HTTP local production-build smoke test. Do not use that value on a public HTTPS host.

## 3. Database migration

```sh
pnpm exec prisma migrate deploy
```

First catalog load (empty database):

```sh
NODE_ENV=production SKYLENT_RUN_SEED=1 pnpm exec prisma db seed
```

After courses exist, seed refuses unless `SKYLENT_ALLOW_DESTRUCTIVE_SEED=1`.

## 4. Production build

```sh
pnpm install
pnpm typecheck
pnpm backend:typecheck
pnpm build
```

`pnpm build` runs `vite build` then compiles `server/src` to `server/dist`.

## 5. Production start

```sh
NODE_ENV=production node server/dist/index.js
```

On Railway, `scripts/railway-start.sh` is the start command.

The process binds `0.0.0.0:$PORT`, serves `/api/v1/*`, then the client `dist/` with SPA fallback for non-file GET routes.

## 6. Health check

`GET /api/v1/health`

- `200` `{ "status": "ok", "db": "ok" }` — process and Postgres responded.
- `503` `{ "status": "error", "db": "error" }` — do not send traffic.

A `503` that is an HTML page from the host (on Hostinger: "The server is temporarily busy") is different: the Node process is not running at all. `server.js` runs `prisma migrate deploy` before it starts the API and exits if that fails, so a database that cannot be reached or that rejects the password stops the whole API, not only the database routes. The reason is in the application's error log.

### Supabase on a host without IPv6 (Hostinger)

Checked on 8 October 2026 from outside the host, with read-only probes:

| Endpoint | Finding |
|---|---|
| `db.<ref>.supabase.co:5432` (direct) | Resolves to an IPv6 address only. Unreachable from an IPv4-only network (Prisma `P1001`). |
| `aws-0-ap-northeast-1.pooler.supabase.com:5432` (session pooler) and `:6543` (transaction pooler) | IPv4, reachable. |
| Pooler login with the stored connection string | Rejected: "provided database credentials are not valid". The Supabase project itself is up. |

So two settings must be right before the API can start:

1. **`DIRECT_URL` must not use the direct host on Hostinger.** Use the session pooler: `postgresql://postgres.<ref>:<password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`. Migrations work through the session pooler.
2. **`DATABASE_URL`** is the pooler too: either the same session URL, or the transaction pooler on port `6543` with `?pgbouncer=true&connection_limit=1`.

In both, the user is `postgres.<ref>` (not `postgres`), and any special character in the password is percent-encoded. If the pooler still rejects the login, the password in the URL is not the database password: set it again under Supabase → Project Settings → Database, then update both variables. Do not reset the database or re-seed.

Restart through the host's own Node.js application control (hPanel → Node.js → Restart). Use `pm2` only if `pm2 list` shows the API is actually running under it.

## 7. First admin

Public signup always creates `STUDENT`. Promote one operator after the database is live:

```sh
SUPERADMIN_EMAIL=you@example.com SUPERADMIN_PASSWORD='…' SUPERADMIN_NAME='…' pnpm bootstrap:superadmin
```

Idempotent: an existing email is elevated to `ADMIN` without changing the password.

## 8. Deployment sequence

1. Provision Postgres and copy its URLs into `DATABASE_URL` / `DIRECT_URL`.
2. Set `SESSION_SECRET`, `FRONTEND_URL`, and `NODE_ENV=production`.
3. Set `SKYLENT_RUN_SEED=1` for the first deploy only.
4. Build, `prisma migrate deploy`, first-time seed, start.
5. Confirm `GET /api/v1/health`.
6. Unset `SKYLENT_RUN_SEED`.
7. Optionally configure Google OAuth and `SKYLENT_AI_*`.
8. Run `pnpm bootstrap:superadmin` once.
9. Attach the public hostname to this service. Set `FRONTEND_URL` (and `CORS_ALLOWED_ORIGINS` if it differs) to that origin. Do not change DNS from this repository.

## 9. Smoke-test sequence

Against the **production** process (not `vite dev`):

1. Homepage, Skills, Courses, Data Analytics, Product Management, programme page.
2. Sign up, enrol, student dashboard, LMS lesson, quiz, assignment.
3. Labs analysis + SQL, project workspace, Career OS.
4. Product Management LMS + project.
5. Sign out. Confirm another account cannot read the first learner’s LMS/Labs/Career resources.

## 10. Rollback

- **Code:** redeploy the previous image/commit. `dist/` is not in git; the previous build artifact is the rollback unit.
- **Database:** Prisma migrations are forward-only here. Do not restore a newer schema onto an older build. Restore a Postgres snapshot taken before a failing migrate if a migration must be undone.
- **Catalog seed:** never roll forward by re-seeding a live database. That deletes curriculum nodes and cascaded lesson/quiz/assignment progress.

## Known production limits (not blockers for the written LMS)

- Assignment attachments are metadata only (`pending/…` keys). Learners submit text in the assignment workspace.
- Skylent AI stays unavailable until `SKYLENT_AI_API_KEY` is set. That is intentional.
- Google sign-in stays 503 until OAuth credentials and redirect URI match `FRONTEND_URL`.
- `lesson-grounded` is a preview provider and is ignored when `NODE_ENV=production`.
