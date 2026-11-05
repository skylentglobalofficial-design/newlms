import "dotenv/config"
import express from "express"
import cors from "cors"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getCorsOrigins, logProductionEnvWarnings, redactSecrets, validateEnv } from "./lib/env.js"
import { prisma } from "./lib/prisma.js"
import { isDatabaseUnavailableError, isMissingSchemaError, unavailableBody } from "./lib/schema-capabilities.js"
import { renderRouteHtml } from "./lib/route-meta.js"
import { apexRedirectLocation, canonicalOriginRedirect, injectCanonicalLink, resolvePublicOrigin } from "./lib/public-host.js"
import { apiRateLimiter, authRateLimiter, requestContextMiddleware, securityHeaders } from "./lib/security-middleware.js"
import { authRouter } from "./routes/auth.js"
import { coursesRouter } from "./routes/courses.js"
import { programsRouter } from "./routes/programs.js"
import { lmsRouter } from "./routes/lms.js"
import { lmsMaterialsRouter } from "./routes/lms-materials.js"
import { projectsRouter } from "./routes/projects.js"
import { labsRouter } from "./routes/labs.js"
import { facultyRouter } from "./routes/faculty.js"
import { organisationRouter } from "./routes/organisation.js"
import { collegeRouter } from "./routes/college.js"
import { adminRouter } from "./routes/admin.js"
import { adminCurriculumRouter } from "./routes/admin-curriculum.js"
import { adminEmployersRouter } from "./routes/admin-employers.js"
import { adminMediaRouter } from "./routes/admin-media.js"
import { adminPlatformRouter } from "./routes/admin-platform.js"
import { practiceRouter } from "./routes/practice.js"
import { practiceAdminRouter } from "./routes/practice-admin.js"
import { skylentRouter } from "./routes/skylent/index.js"
import { careerRouter } from "./routes/career/index.js"
import { careerRiseRouter } from "./routes/career-rise.js"
import { elixirRouter } from "./routes/elixir.js"
import { eventsRouter } from "./routes/events.js"
import { appConfigRouter } from "./routes/app-config.js"
import healthRouter from "./routes/health.js"

validateEnv()
logProductionEnvWarnings()

const app = express()
const port = Number(process.env.PORT ?? 8443)
const host = process.env.HOST ?? "0.0.0.0"

// Trust first proxy (Render, Railway, Fly, nginx) so req.ip and secure cookies work behind TLS termination
if (process.env.NODE_ENV === "production" || process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1)
}

app.disable("x-powered-by")
app.use(requestContextMiddleware)
app.use((req, res, next) => {
  const redirect = canonicalOriginRedirect(req) ?? apexRedirectLocation(req.hostname, req.originalUrl)
  if (redirect) {
    return res.redirect(308, redirect)
  }
  next()
})
app.use(securityHeaders)

const allowedOrigins = getCorsOrigins()
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      // Capacitor / Android WebView / Desktop WebView origins
      if (
        origin === "https://localhost" ||
        origin === "http://localhost" ||
        origin === "capacitor://localhost" ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true)
      }
      return callback(new Error("Origin not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-Requested-With", "Authorization", "X-Skylent-Client"],
  }),
)

app.use(express.json({ limit: "256kb" }))

app.use("/api/v1/health", healthRouter)
app.use("/api/v1/auth", authRateLimiter, authRouter)
app.use("/api/v1/courses", apiRateLimiter, coursesRouter)
app.use("/api/v1/programs", apiRateLimiter, programsRouter)
app.use("/api/v1/lms", apiRateLimiter, lmsRouter)
app.use("/api/v1/lms", apiRateLimiter, lmsMaterialsRouter)
app.use("/api/v1/projects", apiRateLimiter, projectsRouter)
app.use("/api/v1/labs", apiRateLimiter, labsRouter)
app.use("/api/v1/faculty", apiRateLimiter, facultyRouter)
app.use("/api/v1/organisation", apiRateLimiter, organisationRouter)
app.use("/api/v1/college", apiRateLimiter, collegeRouter)
app.use("/api/v1/admin/curriculum", apiRateLimiter, adminCurriculumRouter)
app.use("/api/v1/admin/employers", apiRateLimiter, adminEmployersRouter)
app.use("/api/v1/admin/media", apiRateLimiter, adminMediaRouter)
app.use("/api/v1/admin/platform", apiRateLimiter, adminPlatformRouter)
app.use("/api/v1/admin", apiRateLimiter, adminRouter)
app.use("/api/v1/practice", apiRateLimiter, practiceRouter)
app.use("/api/v1/admin/practice", apiRateLimiter, practiceAdminRouter)
app.use("/api/v1/career", apiRateLimiter, careerRouter)
app.use("/api/v1/career-rise", apiRateLimiter, careerRiseRouter)
app.use("/api/v1/elixir", apiRateLimiter, elixirRouter)
app.use("/api/v1/events", apiRateLimiter, eventsRouter)
app.use("/api/v1/app-config", apiRateLimiter, appConfigRouter)
app.use("/api/v1", apiRateLimiter, skylentRouter)

// Serve built SPA in production when dist/ exists alongside server
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, "../../dist")
const indexPath = path.join(distPath, "index.html")
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html") || filePath.endsWith("sw.js") || filePath.endsWith("manifest.webmanifest")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
          res.setHeader("Pragma", "no-cache")
          res.setHeader("Expires", "0")
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
        }
      },
    }),
  )
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next()
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      res.setHeader("Pragma", "no-cache")
      res.setHeader("Expires", "0")
      const template = fs.readFileSync(indexPath, "utf8")
      const html = injectCanonicalLink(renderRouteHtml(template, req.path, resolvePublicOrigin(req)), req.path)
      res.type("html").send(html)
    } catch {
      res.sendFile(indexPath)
    }
  })
}

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" })
})

app.use((error: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestId = res.locals?.requestId ?? "unknown"
  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({ error: "Forbidden origin", requestId })
  }
  if (isMissingSchemaError(error) || isDatabaseUnavailableError(error)) {
    console.warn(
      `[req:${requestId}] Workspace schema/database unavailable on ${req.method} ${req.originalUrl}: ${error.name}`,
    )
    return res.status(503).json({ ...unavailableBody(), requestId })
  }
  console.error(
    `[req:${requestId}] Unhandled error on ${req.method} ${req.originalUrl}: ${error.name}: ${redactSecrets(error.message)}`,
  )
  res.status(500).json({ error: "Internal server error", requestId })
})

const server = app.listen(port, host, () => {
  console.log(`Skylent API listening on http://${host}:${port}`)
})

async function shutdown(signal: string) {
  console.log(`${signal} received, closing server...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on("SIGTERM", () => void shutdown("SIGTERM"))
process.on("SIGINT", () => void shutdown("SIGINT"))
