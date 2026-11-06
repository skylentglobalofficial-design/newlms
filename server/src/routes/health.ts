import { Router, type Request, type Response } from "express"
import { prisma } from "../lib/prisma.js"
import { checkMigrationState } from "../lib/migration-guard.js"
import { redactSecrets } from "../lib/env.js"
import { describeAiReadiness } from "../lib/skylent-ai/service.js"

const router = Router()

const BOOT_MINUTE = Math.max(1, Math.floor(Date.now() / 60000) - 29900000)
export const DEPLOYED_APP_VERSION = `85.${BOOT_MINUTE}.0`
export const DEPLOYED_BUILD_ID = `v78-${Date.now()}`

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
 * YouTube/Facebook-Style Seamless Auto-Update Config for Skylent Native APK builds.
 * Whenever a new deployment is pushed, installed APKs detect the new buildId and
 * automatically sync & reload into the latest build so users always run the newest version.
 */
router.get("/app-config", (request, response) => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
  const currentStamp = `${DEPLOYED_APP_VERSION}:${DEPLOYED_BUILD_ID}`
  const clientInstalledStamp = typeof request.query.installedBuild === "string" ? request.query.installedBuild.trim() : ""
  const isUpToDate = clientInstalledStamp === currentStamp || clientInstalledStamp === DEPLOYED_BUILD_ID

  response.json({
    appVersion: DEPLOYED_APP_VERSION,
    minSupportedAppVersion: isUpToDate ? "1.0.0" : DEPLOYED_APP_VERSION,
    autoSyncUpdate: !isUpToDate,
    buildId: DEPLOYED_BUILD_ID,
    updateTitle: "Updating Skylent to the latest version…",
    apkDownloadUrl: "https://skylent.live/skylent-latest.apk",
    playStoreUrl:
      process.env.SKYLENT_PLAY_STORE_URL?.trim() ||
      "https://play.google.com/store/apps/details?id=live.skylent.app",
    announcement: process.env.SKYLENT_APP_BANNER?.trim() || null,
    maintenanceMode: process.env.SKYLENT_MAINTENANCE_MODE === "true",
    ...readinessFields(),
  })
})

router.get("/ready", handleReadiness)
router.get("/", handleReadiness)

export default router
