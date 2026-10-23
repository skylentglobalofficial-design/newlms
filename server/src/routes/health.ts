import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { checkMigrationState } from "../lib/migration-guard.js"

const router = Router()

router.get("/", async (_request, response) => {
  const exposeDetail = process.env.NODE_ENV !== "production"
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    console.error("Health check database failure:", error instanceof Error ? error.message : error)
    response.status(503).json({ status: "error", db: "error", ...(exposeDetail ? { detail: error instanceof Error ? error.message : String(error) } : {}) })
    return
  }

  const migrations = await checkMigrationState()
  if (migrations.status === "pending") {
    response.status(503).json({
      status: "error",
      db: "ok",
      migrations: "pending",
      pendingMigrations: migrations.pending.length,
      failedMigrations: migrations.failed.length,
      ...(exposeDetail ? { pending: migrations.pending, failed: migrations.failed } : {}),
    })
    return
  }

  response.json({ status: "ok", db: "ok", migrations: migrations.status })
})

export default router
