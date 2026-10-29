/**
 * server.js is the Hostinger entry. It must load the compiled API and must not
 * run prisma migrate deploy. A closed local port is enough to prove that.
 */
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = readFileSync(join(root, "server.js"), "utf8")

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function redact(text: string) {
  return text.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]")
}

assert(!source.includes("spawnSync"), "server.js must not spawn a process")
assert(!source.includes("prisma/build/index.js"), "server.js must not invoke the Prisma CLI")
assert(!/^await\s/m.test(source), "server.js must not use top-level await")
assert(source.includes('import("./server/dist/index.js")'), "server.js must load the compiled API")
assert(source.includes("DIRECT_URL"), "server.js must keep the DIRECT_URL fallback")

const result = spawnSync(process.execPath, ["-e", "require('./server.js')"], {
  cwd: root,
  env: {
    ...process.env,
    DATABASE_URL: "postgresql://unused:unused@127.0.0.1:1/unused",
    DIRECT_URL: "",
  },
  encoding: "utf8",
  timeout: 20000,
})

const output = redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}`)
assert(result.status === 1, `server.js should exit 1 when the database cannot be reached, got ${result.status}`)
assert(!output.includes("Applying migration"), "server.js applied a migration")
assert(!output.includes("prisma migrate deploy failed"), "server.js ran prisma migrate deploy")
assert(output.includes("Refusing to listen"), "server.js did not stop at the pending-migration guard")
assert(!/ERR_REQUIRE_ASYNC_MODULE/.test(output), "require(server.js) hit a top-level await")

console.log("server-entry ok")
