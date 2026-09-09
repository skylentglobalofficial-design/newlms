import "dotenv/config"
import { execSync, spawn, type ChildProcess } from "node:child_process"

const DEFAULT_PORT = Number(process.env.INTEGRATION_TEST_PORT ?? 3099)
const SECURITY_PORT = Number(process.env.INTEGRATION_SECURITY_PORT ?? 3100)

type Suite = {
  name: string
  command: string
  args: string[]
  port: number
  /** Dedicated API AUTH_RATE_LIMIT_MAX for this suite group. */
  rateLimitMax: string
}

const SUITES: Suite[] = [
  { name: "auth", command: "npm", args: ["run", "test:auth"], port: DEFAULT_PORT, rateLimitMax: "500" },
  { name: "roles", command: "npm", args: ["run", "test:roles"], port: DEFAULT_PORT, rateLimitMax: "500" },
  { name: "lms", command: "npm", args: ["run", "test:lms"], port: DEFAULT_PORT, rateLimitMax: "500" },
  {
    name: "security-middleware",
    command: "npm",
    args: ["run", "test:security-middleware"],
    port: SECURITY_PORT,
    rateLimitMax: "20",
  },
]

type ApiHandle = {
  child: ChildProcess
  port: number
  rateLimitMax: string
}

function apiBase(port: number) {
  return `http://127.0.0.1:${port}/api/v1`
}

async function waitForHealth(port: number, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${apiBase(port).replace("/api/v1", "")}/api/v1/health`)
      if (response.ok) return
    } catch {
      // API still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`API did not become healthy on port ${port}`)
}

function startApi(port: number, rateLimitMax: string): ChildProcess {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PORT: String(port),
    AUTH_RATE_LIMIT_MAX: rateLimitMax,
  }

  const child = spawn("npx", ["tsx", "server/src/index.ts"], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  })

  const prefix = `[api:${port}]`
  child.stdout?.on("data", (chunk) => process.stdout.write(`${prefix} ${chunk}`))
  child.stderr?.on("data", (chunk) => process.stderr.write(`${prefix} ${chunk}`))

  return child
}

function killPort(port: number) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" })
  } catch {
    // Port already closed or fuser unavailable.
  }
}

function stopApi(handle: ApiHandle | null): void {
  if (!handle) return
  handle.child.stdout?.destroy()
  handle.child.stderr?.destroy()
  if (handle.child.exitCode === null) {
    handle.child.kill("SIGKILL")
  }
  handle.child.unref()
  killPort(handle.port)
}

async function ensureApi(
  active: ApiHandle | null,
  port: number,
  rateLimitMax: string,
): Promise<ApiHandle> {
  if (active && active.port === port && active.rateLimitMax === rateLimitMax) {
    return active
  }

  stopApi(active)
  const child = startApi(port, rateLimitMax)
  await waitForHealth(port)
  return { child, port, rateLimitMax }
}

async function runSuite(suite: Suite): Promise<void> {
  console.log(`\n=== ${suite.name} ===`)
  const child = spawn(suite.command, suite.args, {
    stdio: "inherit",
    env: {
      ...process.env,
      API_BASE: apiBase(suite.port),
    },
  })

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on("error", reject)
    child.on("exit", (code) => resolve(code ?? 1))
  })

  if (exitCode !== 0) {
    throw new Error(`${suite.name} failed with exit code ${exitCode}`)
  }
}

async function main() {
  let api: ApiHandle | null = null

  try {
    for (const suite of SUITES) {
      api = await ensureApi(api, suite.port, suite.rateLimitMax)
      await runSuite(suite)
    }
  } finally {
    stopApi(api)
    killPort(DEFAULT_PORT)
    killPort(SECURITY_PORT)
  }
}

main()
  .then(() => {
    console.log("\nAll integration suites passed.")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
