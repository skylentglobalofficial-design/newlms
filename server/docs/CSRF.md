# CSRF Strategy (Phase 7B foundation for 7C)

Authentication uses an HttpOnly session cookie (`sid`). HttpOnly cookies are not readable by JavaScript and reduce XSS token theft, but they do **not** prevent cross-site request forgery on their own.

## Approach: double-submit cookie

1. `GET /api/v1/auth/csrf` issues a non-HttpOnly `csrf` cookie and returns the same token in JSON.
2. State-changing auth routes (`POST /signup`, `POST /login`, `POST /logout`) require:
   - `X-CSRF-Token` request header
   - matching `csrf` cookie value
3. Phase 7C will extend the same middleware to other mutating API routes (enrollment, progress, applications).

## Cookie flags

| Cookie | HttpOnly | SameSite | Secure (production) | Path |
|--------|----------|----------|---------------------|------|
| `sid`  | yes      | Lax      | yes                 | `/`  |
| `csrf` | no       | Lax      | yes                 | `/`  |

`SameSite=Lax` blocks cross-site POST submissions from unrelated origins in modern browsers. The double-submit header check adds defense in depth for same-site and future API clients.

## Client responsibilities

- Fetch CSRF before the first state-changing request.
- Send `credentials: "include"` on all auth API calls.
- Include `X-CSRF-Token` on `POST`/`PUT`/`PATCH`/`DELETE`.

## Out of scope for 7B

- Per-route role authorization (`requireRole`, `requireOrganisationMembership`) — Phase 7C.
- Rotating CSRF tokens on every request — optional hardening for later.
