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
- Object storage for assignment file bytes (today only metadata is stored with `storageProvider: pending`). `server/src/lib/storage.ts` implements **local filesystem only** (refused when `NODE_ENV=production`). S3/GCS/Azure are not implemented — do not set `STORAGE_PROVIDER` to those values expecting uploads to work.
- Email delivery for password reset: `EMAIL_PROVIDER=mailgun` or `sendgrid` plus `EMAIL_FROM` and provider keys. `ses` / `smtp` are not implemented and will not report as configured.

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
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth. Production callback is `https://skylent.live/api/v1/auth/google/callback`. A localhost `GOOGLE_REDIRECT_URI` is ignored when `NODE_ENV=production`. |
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
| `EMAIL_PROVIDER` / `EMAIL_FROM` | Password reset mail. Only `mailgun` and `sendgrid` are implemented. |
| `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` | When `EMAIL_PROVIDER=mailgun`. |
| `SENDGRID_API_KEY` | When `EMAIL_PROVIDER=sendgrid`. |
| `STORAGE_PROVIDER` / `STORAGE_BUCKET` | Do not enable in production until a cloud provider is implemented. `local` is refused when `NODE_ENV=production`. |

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

Before deploying to an existing database, run the read-only preflight with the production connection in the environment:

```sh
npm run db:preflight
```

It opens one `READ ONLY` transaction, prints the host, database name, target class, and migration names, and ends with `DECISION: PASS` or `DECISION: BLOCKED`. It exits `0` (pass), `1` (blocked) or `2` (could not check). It blocks on a failed migration, an unrecognised applied migration, destructive SQL in a pending migration, or a pending migration that creates a table or enum that already exists. `npm run db:preflight -- --production` refuses every target except the Supabase session pooler on port 5432, and it does not connect when the target is wrong. A pending `ProgramCourse` backfill is printed as `REVIEW`; with `--production` it blocks until `--approve-backfill` is also passed. After the deploy, `npm run db:preflight -- --expect-none` must exit `0`.

Production has four applied migrations that are not in `prisma/migrations` (`20260906190000_lesson_materials`, `20260907100000_lesson_material_upload_status`, `20260907120000_curriculum_node_notes_body`, `20260907140000_assignment_attachment_upload_status`). Their SQL is kept, for reference and tests only, in `scripts/fixtures/production-only-migrations/`. Do not delete, rename, re-create or `migrate resolve` them. Because of them, `prisma migrate status` exits `1` against production. That is expected and is not a blocker. `migrate deploy` ignores them and applies only the pending local migrations. `npm run test:migration-replay` proves this against a local scratch database.

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
NODE_ENV=production npm start   # node server.js
```

`server.js` runs `prisma migrate deploy` and exits without starting the API if it fails. `node server/dist/index.js` starts the API **without** migrating; with that start command, migrations must be run separately before the restart. On Railway, `scripts/railway-start.sh` is the start command (it also migrates first).

Because `server.js` migrates on every start, a restart on a host that uses it is a production migration. Take and verify the database backup before any restart that ships new migrations.

The process binds `0.0.0.0:$PORT`, serves `/api/v1/*`, then the client `dist/` with SPA fallback for non-file GET routes.

## 6. Health check

`GET /api/v1/health`

- `200` `{ "status": "ok", "db": "ok", "migrations": "ok", "ai": "configured"|"preview"|"not_configured", "release": "<sha>|unknown" }` — process and Postgres responded, and every local migration is applied. `ai` is separate: `not_configured` does not by itself fail this check. `release` is `SKYLENT_RELEASE_SHA` when that value is a git SHA, otherwise `unknown`.
- `503` with `"migrations": "unknown"` — Postgres answered `SELECT 1`, but the migration table could not be read. Do not treat the process as ready.
- `503` `{ "status": "error", "db": "ok", "migrations": "pending", "pendingMigrations": N, "failedMigrations": N }` — the running code is newer than the schema (for example the API was started with `node server/dist/index.js` and nothing migrated). Do not send traffic. Names are listed only outside production; the startup log names them in every environment.
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

## 8a. Upgrading an existing production database (Hostinger)

Mandatory sequence — do not skip steps. Do not use `prisma db push`, `migrate reset`, `migrate resolve`, destructive seed, or ad-hoc DROP/DELETE SQL.

1. **Verified backup and recovery path.** Supabase → Database → Backups shows a backup newer than the last schema change, **or** a `pg_dump -Fc` was taken through the session pooler and `pg_restore --list` reads it. Confirm who can restore and how. Without this, stop.
2. **Confirm runtime and direct URLs target the same intended database.** In hPanel → Node.js, record start command, Node version, and deployed commit. Confirm `DATABASE_URL` and `DIRECT_URL` resolve to the same logical Postgres database (Hostinger: both via session/transaction pooler — never the IPv6-only direct host). Record host + database name from preflight output only (never passwords).
3. **Read-only preflight with the exact expected migration set.** From a trusted machine with production URLs in the environment (not pasted into chat or committed files):

   ```sh
   npm run db:preflight
   ```

   Against the historical production baseline used by `npm run test:migration-replay`, expect: ready to deploy, **eight** pending release migrations (the seven October migrations through `20261024140000_password_reset_and_degrees`, plus `20261025180000_elixir_ledger_and_admin_audit`), four lesson-material migrations as expected production-only, zero failed. **If the report differs from that expectation, stop and reconcile — do not treat the number eight as proof of live state without this output.** Live production history has not been verified.
4. **Explicit operator approval.** Named approver records go/no-go after reviewing backup evidence and preflight output.
5. **Migration execution by an authorized operator.** Deploy the new build. If the start command is `server.js` / `npm start`, the restart applies migrations; otherwise run `npx prisma migrate deploy` with the same environment **before** restarting a non-migrating entrypoint.
6. **Post-migration verification.** `GET /api/v1/health` must return `200` with `"migrations": "ok"`. Run `npm run db:preflight -- --expect-none`. Run the smoke tests in section 9.

Local proof that this deploy path works against a **simulated** production history (not live production): `npm run test:migration-replay` on localhost Postgres only.

## 9. Smoke-test sequence

Against the **production** process (not `vite dev`):

1. Homepage, Skills, Courses, Data Analytics, Product Management, programme page.
2. Sign up, enrol, student dashboard, LMS lesson, quiz, assignment.
3. Labs analysis + SQL, project workspace, Career OS.
4. Product Management LMS + project.
5. Sign out. Confirm another account cannot read the first learner’s LMS/Labs/Career resources.

## 10. Rollback

- **Code:** redeploy the previous image/commit. `dist/` is not in git; the previous build artifact is the rollback unit.
- **Code after the October migrations:** those migrations add tables, columns, enums and indexes, and fill `ProgramCourse` links. `20261025180000_elixir_ledger_and_admin_audit` adds the Elixir ledger and audit log and does not rewrite existing rows. The previous build ignores unknown tables, so rolling back the code does not need a schema restore. Enum additions and inserted `ProgramCourse` rows are not undone by a code rollback.
- **Database:** Prisma migrations are forward-only here. Do not restore a newer schema onto an older build. Restore a Postgres snapshot taken before a failing migrate if a migration must be undone.
- **Catalog seed:** never roll forward by re-seeding a live database. That deletes curriculum nodes and cascaded lesson/quiz/assignment progress.

## Known production limits (not blockers for the written LMS)

- Assignment attachments are metadata only (`pending/…` keys). Learners submit text in the assignment workspace. Local filesystem storage must not be enabled in production; cloud providers are not implemented yet.
- Password reset API is present; emails send only when Mailgun or SendGrid is fully configured. Until then, request endpoints still return a generic success body.
- Degrees backend API is present; the public education UI may still show static sample listings until wired to `/api/v1/degrees`.
- Skylent AI stays unavailable until `SKYLENT_AI_API_KEY` is set. That is intentional.
- Google sign-in stays 503 until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. In production the callback is the public https `/api/v1/auth/google/callback` on the request host, or on `FRONTEND_URL` when that value is already public https. Register that exact URI in Google Cloud Console.
- `lesson-grounded` is a preview provider and is ignored when `NODE_ENV=production`.
