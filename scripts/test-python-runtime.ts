/**
 * Python runtime stays closed until an isolated service exists.
 * Run: API_BASE=http://127.0.0.1:3000/api/v1 npx tsx scripts/test-python-runtime.ts
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { TEST_CONSENT } from "./test-consent-payload.ts"
import { provisionCourse } from "../src/lib/practice-platform/index.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const source = readFileSync(resolve("server/src/lib/practice-runtime/python.ts"), "utf8")
assert(!/child_process|spawn\(|execFile|exec\(/.test(source), "The Python runtime module must not spawn a local process")

const notebook = provisionCourse({
  courseSlug: "data-science-ai",
  programmeSlug: "data-science-ai",
  title: "Data Science & AI",
  outcomes: ["Explore a dataset"],
  tools: ["Python", "pandas"],
  lessons: [{ id: "l1", title: "Clean the extract", type: "assignment", exercise: "notebook" }],
})
assert(notebook.status === "pending_infrastructure", "Notebook courses stay unpublished")
assert(notebook.href === null, "Notebook courses have no learner route")
assert(notebook.missing.some((row) => /isolated Python runtime/i.test(row)), "The missing runtime is named")

async function main() {
const API = process.env.PRACTICE_API_BASE ?? process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"
const jar = new Map<string, string>()
function store(response: Response) {
  for (const header of response.headers.getSetCookie?.() ?? []) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
}
async function call(path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {}
  const cookie = Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
  const response = await fetch(`${API}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  store(response)
  const text = await response.text()
  return { status: response.status, body: text, data: text ? JSON.parse(text) : null }
}

const anon = await call("/practice/runtimes/python/execute", {
  method: "POST",
  body: { courseSlug: "data-science-ai", lessonId: "l1", source: "print(1)" },
})
assert(anon.status === 401, `Anonymous execution must be refused, got ${anon.status}`)

await call("/auth/csrf")
const signup = await call("/auth/signup", {
  method: "POST",
  csrf: true,
  body: { consent: TEST_CONSENT, displayName: "Runtime", email: `runtime-${Date.now()}@example.com`, password: "test-password-123" },
})
assert(signup.status === 201, `Signup failed: ${signup.body}`)
const secret = "print('learner-secret-marker')"
const closed = await call("/practice/runtimes/python/execute", {
  method: "POST",
  csrf: true,
  body: { courseSlug: "data-science-ai", lessonId: "l1", source: secret },
})
assert(closed.status === 503, `Closed runtime must return 503, got ${closed.status} ${closed.body}`)
assert(closed.data.code === "runtime_unavailable", "Failure uses the runtime_unavailable code")
assert(!closed.body.includes("learner-secret-marker"), "The failure must not echo learner source")
assert(!/"stdout"/.test(closed.body), "The failure must not invent execution output")

console.log("python runtime: closed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
