import cors from "cors"
import express, { type NextFunction, type Request, type Response } from "express"
import rateLimit from "express-rate-limit"

export const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT ?? "512kb"

export function getAllowedOrigins(): string[] {
  const explicit = process.env.CORS_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) ?? []

  if (explicit.length > 0) return expandSkylentSiteOrigins(explicit)

  const origins = new Set<string>()
  const frontend = process.env.FRONTEND_URL?.trim()
  if (frontend) origins.add(frontend)

  if (process.env.NODE_ENV !== "production") {
    for (const port of [5173, 8443, 3000, 4173]) {
      origins.add(`http://localhost:${port}`)
      origins.add(`http://127.0.0.1:${port}`)
    }
  }

  return expandSkylentSiteOrigins([...origins])
}

/** Apex and www are the same public site. Credentialed calls must work from both. */
function expandSkylentSiteOrigins(origins: string[]): string[] {
  const next = new Set(origins)
  for (const origin of origins) {
    try {
      const url = new URL(origin)
      if (url.hostname === "skylent.live") next.add(`${url.protocol}//www.skylent.live`)
      if (url.hostname === "www.skylent.live") next.add(`${url.protocol}//skylent.live`)
    } catch {
      // Ignore malformed allow-list entries; cors will reject them as usual.
    }
  }
  return [...next]
}

export function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins()

  return cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
    credentials: true,
  })
}

export const authCredentialsRateLimit = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler(_request, response) {
    response.status(429).json({ error: "Too many attempts. Please try again later." })
  },
})

export function jsonBodyParser() {
  return express.json({ limit: JSON_BODY_LIMIT })
}

export function securityHeaders(_request: Request, response: Response, next: NextFunction) {
  response.setHeader("X-Content-Type-Options", "nosniff")
  response.setHeader("X-Frame-Options", "DENY")
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  if (process.env.NODE_ENV === "production") {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
  next()
}
