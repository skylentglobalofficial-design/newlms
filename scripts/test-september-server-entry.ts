/**
 * Starts the real server.js entry against the local September fixture.
 * Run as the OS user postgres. Refuses to start if the database identity differs.
 */
import { spawn, type ChildProcess } from "node:child_process"
import { createServer } from "node:net"
import { userInfo } from "node:os"
import { readFileSync } from "node:fs"
import { localSocketUrl } from "./create-september-schema-fixture.ts"

const fixture = "skylent_september_33e64235d6accf31"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function redact(text: string): string {
  return text.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]")
}

if (userInfo().username !== "postgres") {
  console.error("The server entry test must run as the OS user postgres. No database was contacted.")
  process.exit(1)
}

const compiled = readFileSync(new URL("../server/dist/index.js", import.meta.url), "utf8")
if (!compiled.includes("September compatibility listen")) {
  console.error("server/dist is older than the September compatibility guard. Run npm run backend:build. The server was not started.")
  process.exit(1)
}

process.env.DATABASE_URL = localSocketUrl(fixture)
process.env.DIRECT_URL = process.env.DATABASE_URL
delete process.env.SKYLENT_SEPTEMBER_TEST_DATABASE_URL

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once("error", reject)
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address()
      const port = typeof address === "object" && address ? address.port : 0
      probe.close(() => resolve(port))
    })
  })
}

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const [before] = await prisma.$queryRaw<{ current: string; rows: number; october: number }[]>`
    SELECT current_database() AS current,
           (SELECT count(*)::int FROM "_prisma_migrations") AS rows,
           (SELECT count(*)::int FROM "_prisma_migrations" WHERE migration_name LIKE '202610%') AS october`
  await prisma.$disconnect()
  if (before?.current !== fixture || before.rows !== 12 || before.october !== 0) {
    console.error("refusing to start: database is not the September fixture")
    process.exit(1)
  }

  const port = await freePort()
  const env: NodeJS.ProcessEnv = { ...process.env }
  delete env.DATABASE_URL
  delete env.DIRECT_URL
  env.NODE_ENV = "production"
  env.PORT = String(port)
  env.DATABASE_URL = localSocketUrl(fixture)
  env.DIRECT_URL = env.DATABASE_URL
  env.SESSION_SECRET = "local-september-server-entry-secret-value"
  env.FRONTEND_URL = `http://127.0.0.1:${port}`
  env.SKYLENT_SEPTEMBER_COMPAT = "1"

  const child: ChildProcess = spawn("/exec-daemon/node", ["server.js"], {
    cwd: new URL("..", import.meta.url).pathname,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  })
  let output = ""
  child.stdout?.on("data", (chunk: Buffer) => {
    output += chunk.toString()
  })
  child.stderr?.on("data", (chunk: Buffer) => {
    output += chunk.toString()
  })

  const base = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 20_000
  let health: Response | null = null
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited ${child.exitCode} before listen\n${redact(output)}`)
    }
    try {
      health = await fetch(`${base}/api/v1/health`)
      break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  if (!health) {
    child.kill("SIGTERM")
    throw new Error(`server did not listen within 20s\n${redact(output)}`)
  }

  try {
    const healthBody = await health.json() as Record<string, unknown>
    assert(health.status === 503 && healthBody.db === "ok" && healthBody.migrations === "pending", `health ${health.status}`)
    assert(healthBody.pendingMigrations === 11 && healthBody.failedMigrations === 0, "health counts")
    assert(healthBody.status === "error", "health must not report ready")

    const root = await fetch(`${base}/`)
    const html = await root.text()
    assert(root.status === 200 && root.headers.get("content-type")?.includes("html"), `home ${root.status}`)
    assert(html.includes('id="root"') && html.includes("Skylent"), "home HTML was not the Skylent shell")

    const programs = await fetch(`${base}/api/v1/catalog/programs`)
    const programBody = await programs.json() as { data?: Array<{ slug: string }> }
    assert(programs.status === 200 && programBody.data?.some((row) => row.slug === "data-analytics-pro"), "programmes")
    assert(programBody.data?.some((row) => row.slug === "product-management"), "product programme missing")

    const courses = await fetch(`${base}/api/v1/catalog/courses`)
    const courseBody = await courses.json() as { data?: Array<{ slug: string }> }
    assert(courses.status === 200 && courseBody.data?.some((row) => row.slug === "data-analytics"), "courses")
    assert(courseBody.data?.some((row) => row.slug === "product-management"), "product course missing")

    assert(!output.includes("Applying migration"), "the server applied a migration")
    assert(output.includes("September compatibility listen"), "the server did not record compatibility mode")
    assert(output.includes("API listening"), "the server did not log that it was listening")
    console.log("September server entry checks passed")
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM")
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          child.kill("SIGKILL")
          resolve()
        }, 5000)
        child.once("exit", () => {
          clearTimeout(timer)
          resolve()
        })
      })
    }
  }

  const { prisma: afterClient } = await import("../server/src/lib/prisma.ts")
  const [after] = await afterClient.$queryRaw<{ rows: number; october: number }[]>`
    SELECT (SELECT count(*)::int FROM "_prisma_migrations") AS rows,
           (SELECT count(*)::int FROM "_prisma_migrations" WHERE migration_name LIKE '202610%') AS october`
  await afterClient.$disconnect()
  assert(after?.rows === 12 && after.october === 0, "server entry changed migration history")
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : "server entry test failed"))
  process.exitCode = 1
})
