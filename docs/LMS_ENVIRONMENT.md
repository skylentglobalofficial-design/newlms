# LMS environment contract

Skylent’s learner LMS uses optional external services. The app must behave honestly when they are missing — no fake playback IDs, no silent upload success.

## Required for core API + database

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma / PostgreSQL |
| `SESSION_SECRET` | Session cookie signing |
| `FRONTEND_URL` | OAuth redirects and CORS assumptions |

## Optional — Mux video (`data-analytics` lesson `l1`)

| Variable | Purpose |
|----------|---------|
| `MUX_DEMO_PLAYBACK_ID` | **Real** public Mux playback ID for the canonical demo video lesson |

**When CONFIGURED:** After `npm run db:seed`, `data-analytics/l1` stores the ID; API returns `provider: "mux"`; LearnPage mounts `mux-player`.

**When NOT CONFIGURED:** Seed sets `muxPlaybackId` to `null`; API returns `provider: "unavailable"`; UI shows the honest preview surface with manual “Mark as watched” (completion still persists via progress API).

Do not use placeholder strings (`mux-*`, seed verification tokens). The server rejects invalid IDs.

## Optional — Cloudflare R2 (assignment attachments + lesson materials)

| Variable | Purpose |
|----------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | Private bucket name |
| `R2_ENDPOINT` | Optional; defaults to `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` |

**When CONFIGURED:** Faculty can create presigned uploads; learners can complete uploads; attachments become `READY` only after `complete-upload` verifies the object exists.

**When NOT CONFIGURED:** Upload endpoints return **503**; UI shows explicit errors; materials may list as “Unavailable (storage pending)” if seeded without an object.

## Development demo accounts

See `.env.example` and `prisma/DEMO_ACCOUNTS.md`. Password defaults to `DemoSkylent2026!` (`DEMO_USER_PASSWORD`).

## Verification commands

```bash
npm run test:lms          # Prints Mux/R2 CONFIGURED vs NOT CONFIGURED at start
npm run test:r2-roundtrip # Live R2 round-trip when credentials exist; NOT_RUN otherwise
npx tsx scripts/diagnose-mux-playback.ts  # DB ↔ API ↔ env alignment for l1
```

## Test behaviour

- `test:lms` **does not** invent fake Mux IDs or R2 objects.
- Mux round-trip tests **SKIP** when `MUX_DEMO_PLAYBACK_ID` is unset.
- R2 attachment tests branch on `isObjectStorageConfigured()` and assert honest pending/unavailable states when not configured.
