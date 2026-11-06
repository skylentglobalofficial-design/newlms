import { Router, type Request, type Response } from "express"
import { prisma } from "../lib/prisma.js"
import { checkMigrationState } from "../lib/migration-guard.js"
import { redactSecrets } from "../lib/env.js"
import { describeAiReadiness } from "../lib/skylent-ai/service.js"

const router = Router()

export const DEPLOYED_APP_VERSION = "1.4.0"
export const DEPLOYED_BUILD_ID = "v74-202611061057"

function releaseSha(): string {
  const sha = process.env.SKYLENT_RELEASE_SHA?.trim() ?? ""
  return /^[0-9a-f]{7,40}$/i.test(sha) ? sha : DEPLOYED_BUILD_ID
}

function readinessFields() {
  return {
    ai: describeAiReadiness().publicStatus,
    release: releaseSha(),
  }
}

async function handleReadiness(_request: Request, response: Response) {
  const exposeDetail = process.env.NODE_ENV !== "production"
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    const detail = redactSecrets(error instanceof Error ? error.message : String(error))
    console.error("Health check database failure:", detail)
    response.status(503).json({ status: "error", db: "error", ...readinessFields(), ...(exposeDetail ? { detail } : {}) })
    return
  }

  const migrations = await checkMigrationState()
  if (migrations.status === "unknown") {
    console.error("Health check migration history unreadable:", redactSecrets(migrations.reason))
    response.status(503).json({
      status: "error",
      db: "ok",
      migrations: "unknown",
      ...readinessFields(),
    })
    return
  }
  if (migrations.status === "pending") {
    response.status(503).json({
      status: "error",
      db: "ok",
      migrations: "pending",
      pendingMigrations: migrations.pending.length,
      failedMigrations: migrations.failed.length,
      ...readinessFields(),
      ...(exposeDetail ? { pending: migrations.pending, failed: migrations.failed } : {}),
    })
    return
  }

  response.json({ status: "ok", db: "ok", migrations: "ok", ...readinessFields() })
}

router.get("/live", (_request, response) => {
  response.json({ status: "ok", live: true, ...readinessFields() })
})

/**
 * Remote App Config & OTA Version Gate for Skylent Android/iOS Native APK builds.
 * Automatically notifies installed APKs whenever a new deployment is pushed to Hostinger.
 */
router.get("/app-config", (_request, response) => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
  response.json({
    appVersion: process.env.SKYLENT_APP_VERSION?.trim() || DEPLOYED_APP_VERSION,
    minSupportedAppVersion: process.env.SKYLENT_MIN_APP_VERSION?.trim() || "1.0.0",
    buildId: DEPLOYED_BUILD_ID,
    updateTitle: "New Skylent Update Live (UI Polish, Plans & Security)",
    apkDownloadUrl: "https://skylent.live/skylent-latest.apk",
    playStoreUrl:
      process.env.SKYLENT_PLAY_STORE_URL?.trim() ||
      "https://play.google.com/store/apps/details?id=com.skylent.app",
    announcement: process.env.SKYLENT_APP_BANNER?.trim() || null,
    maintenanceMode: process.env.SKYLENT_MAINTENANCE_MODE === "true",
    ...readinessFields(),
  })
})

router.get("/ready", handleReadiness)
router.get("/", handleReadiness)

export default router
