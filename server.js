// Hostinger Node.js entrypoint compatibility shim.
// Apply pending Prisma migrations, then start the compiled API.
import { spawnSync } from "node:child_process"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
})
if (migrate.status !== 0) {
  console.error("prisma migrate deploy failed")
  process.exit(migrate.status ?? 1)
}

await import("./server/dist/index.js")
