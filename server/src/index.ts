import "dotenv/config"
import { existsSync, readFileSync } from "node:fs"
import { dirname, extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import express from "express"

import { assertProductionEnv, redactSecrets } from "./lib/env.js"
import { describeAiReadiness } from "./lib/skylent-ai/service.js"
import { apexRedirectLocation, injectCanonicalLink } from "./lib/public-host.js"
import { checkMigrationState, decideStartup } from "./lib/migration-guard.js"
import { prisma } from "./lib/prisma.js"
import {
  authCredentialsRateLimit,
  createCorsMiddleware,
  jsonBodyParser,
  securityHeaders,
} from "./lib/security-middleware.js"
import catalogRouter from "./routes/catalog.js"
import healthRouter from "./routes/health.js"
import { adminRouter } from "./routes/admin.js"
import { adminPlatformRouter } from "./routes/admin-platform.js"
import { elixirRouter } from "./routes/elixir.js"
import { practiceAdminRouter } from "./routes/practice-admin.js"
import { practiceRouter } from "./routes/practice.js"
import { adminEmployersRouter } from "./routes/admin-employers.js"
import { adminMediaRouter } from "./routes/admin-media.js"
import { authRouter } from "./routes/auth.js"
import { lmsRouter } from "./routes/lms.js"
import { skylentAiRouter } from "./routes/skylent-ai.js"
import { labsRouter } from "./routes/labs.js"
import { projectsRouter } from "./routes/projects.js"
import { facultyRouter } from "./routes/faculty.js"
import { organisationRouter } from "./routes/organisation.js"
import { collegeRouter } from "./routes/college.js"
import { lmsMaterialsRouter } from "./routes/lms-materials.js"
import { careerRouter } from "./routes/career/index.js"
import { careerRiseRouter } from "./routes/career-rise.js"
import { adminCurriculumRouter } from "./routes/admin-curriculum.js"
import { skylentCertificatesRouter } from "./routes/skylent/certificates.js"
import { skylentEnquiriesRouter } from "./routes/skylent/enquiries.js"
import { revaRouter } from "./routes/skylent/reva.js"
import { eventsRouter } from "./routes/events.js"
import { degreesRouter } from "./routes/degrees.js"

assertProductionEnv()

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.disable("x-powered-by")

if (process.env.NODE_ENV === "production") {
  const hops = Number(process.env.TRUST_PROXY ?? 1)
  app.set("trust proxy", Number.isFinite(hops) && hops >= 0 ? hops : 1)
}

app.use(securityHeaders)
app.use((request, response, next) => {
  const location = apexRedirectLocation(request.hostname, request.originalUrl)
  if (!location) {
    next()
    return
  }
  const status = request.method === "GET" || request.method === "HEAD" ? 301 : 308
  response.redirect(status, location)
})
app.use(createCorsMiddleware())
app.use(jsonBodyParser())
app.use("/api/v1/auth/login", authCredentialsRateLimit)
app.use("/api/v1/auth/signup", authCredentialsRateLimit)
app.use("/api/v1/health", healthRouter)
app.use("/api/v1/catalog", catalogRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/lms", skylentAiRouter)
app.use("/api/v1/lms/projects", projectsRouter)
app.use("/api/v1/lms", lmsRouter)
app.use("/api/v1/labs", labsRouter)
app.use("/api/v1/faculty", facultyRouter)
app.use("/api/v1/organisation", organisationRouter)
app.use("/api/v1/college", collegeRouter)
app.use("/api/v1/lms", lmsMaterialsRouter)
app.use("/api/v1/career", careerRouter)
app.use("/api/v1/career-rise", careerRiseRouter)
app.use("/api/v1/admin/curriculum", adminCurriculumRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/admin", adminPlatformRouter)
app.use("/api/v1/elixir", elixirRouter)
app.use("/api/v1/admin", practiceAdminRouter)
app.use("/api/v1/practice", practiceRouter)
app.use("/api/v1/admin", adminEmployersRouter)
app.use("/api/v1/admin", adminMediaRouter)
app.use("/api/v1/certificates", skylentCertificatesRouter)
app.use("/api/v1/enquiries", skylentEnquiriesRouter)
app.use("/api/v1/reva", revaRouter)
app.use("/api/v1/events", eventsRouter)
app.use("/api/v1/degrees", degreesRouter)
app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Not found" })
})

if (process.env.NODE_ENV === "production") {
  const clientDist = resolve(dirname(fileURLToPath(import.meta.url)), "../../dist")

  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(response, filePath) {
        if (filePath.endsWith("index.html")) {
          response.setHeader("Cache-Control", "no-cache")
          return
        }
        if (filePath.includes(`${sep}assets${sep}`)) {
          response.setHeader("Cache-Control", "public, max-age=31536000, immutable")
        }
      },
    }),
  )

  app.get(/^(?!\/api(?:\/|$)).*/, (request, response, next) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      next()
      return
    }
    const extension = extname(request.path)
    if (extension && extension !== ".html") {
      response.status(404).end()
      return
    }
    const indexPath = resolve(clientDist, "index.html")
    if (!existsSync(indexPath)) {
      next()
      return
    }
    let html = spaTemplate
    try {
      if (!html) html = spaTemplate = readFileSync(indexPath, "utf8")
    } catch (error) {
      next(error)
      return
    }
    response.setHeader("Cache-Control", "no-cache")
    response.type("html").send(injectCanonicalLink(html, request.path))
  })
}

let spaTemplate: string | null = null

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    response.status(413).json({ error: "Request body too large" })
    return
  }
  console.error(error)
  if (response.headersSent) {
    next(error)
    return
  }
  response.status(500).json({ error: "Internal server error" })
})

let server: ReturnType<typeof app.listen> | undefined

async function start(): Promise<void> {
  const state = await checkMigrationState()
  if (decideStartup(state, process.env.SKYLENT_SEPTEMBER_COMPAT) !== "listen") {
    const detail =
      state.status === "unknown"
        ? redactSecrets(state.reason)
        : `Pending: ${state.pending.join(", ") || "none"}. Failed: ${state.failed.join(", ") || "none"}.`
    console.error(
      `Refusing to listen. Database schema is not ready for this release. ${detail} Run \`npx prisma migrate deploy\` before starting the API.`,
    )
    await prisma.$disconnect()
    process.exit(1)
  }
  if (state.status === "pending") {
    console.error("September compatibility listen. Migrations remain pending. Health stays unavailable.")
  }

  server = app.listen(port, "0.0.0.0", () => {
    const ai = describeAiReadiness()
    const release = process.env.SKYLENT_RELEASE_SHA?.trim()
    console.log(`API listening on port ${port}`)
    console.log(`AI readiness: ${ai.publicStatus} (${ai.reason}). Release: ${release && /^[0-9a-f]{7,40}$/i.test(release) ? release : "unknown"}`)
  })
}

void start()

let shuttingDown = false
function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`Received ${signal}, shutting down`)
  const finish = (closeError?: Error | null) => {
    void prisma.$disconnect().finally(() => {
      process.exit(closeError ? 1 : 0)
    })
  }
  if (!server) {
    finish()
    return
  }
  server.close((closeError) => finish(closeError))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

export default app
