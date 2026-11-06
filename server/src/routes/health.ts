import { Router, type Request, type Response } from "express"
import { prisma } from "../lib/prisma.js"
import { checkMigrationState } from "../lib/migration-guard.js"
import { redactSecrets } from "../lib/env.js"
import { describeAiReadiness } from "../lib/skylent-ai/service.js"

const router = Router()

function releaseSha(): string {
  const sha = process.env.SKYLENT_RELEASE_SHA?.trim() ?? ""
  return /^[0-9a-f]{7,40}$/i.test(sha) ? sha : "unknown"
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
 * Remote App Config & OTA In-App Update Gate for Skylent Android/iOS Native APK & Web App.
 * Reads live version pushed by Admin in _skylent_runtime_config ('app_update_config')
 * so users receive an instant 1-Click In-App Update prompt without manual APK hunting.
 */
router.get("/app-config", async (_request, response) => {
  let dynamicVersion = process.env.SKYLENT_APP_VERSION?.trim() || "1.4.0"
  let dynamicNotes = "Faster dashboard loading, clean Order Details checkout & in-app PayU payment support."
  let dynamicBanner: string | null = process.env.SKYLENT_APP_BANNER?.trim() || null

  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "value" FROM "_skylent_runtime_config" WHERE "key" = 'app_update_config' LIMIT 1`,
    )) as Array<{ value?: string }>
    if (rows?.[0]?.value) {
      const parsed = JSON.parse(rows[0].value) as {
        appVersion?: string
        releaseNotes?: string
        announcement?: string | null
      }
      if (parsed.appVersion) dynamicVersion = parsed.appVersion
      if (parsed.releaseNotes) dynamicNotes = parsed.releaseNotes
      if (parsed.announcement !== undefined) dynamicBanner = parsed.announcement
    }
  } catch {
    // fallback to defaults
  }

  response.json({
    appVersion: dynamicVersion,
    minSupportedAppVersion: process.env.SKYLENT_MIN_APP_VERSION?.trim() || "1.0.0",
    playStoreUrl:
      process.env.SKYLENT_PLAY_STORE_URL?.trim() ||
      "https://play.google.com/store/apps/details?id=live.skylent.app",
    apkDownloadUrl: "/skylent-latest.apk",
    releaseNotes: dynamicNotes,
    announcement: dynamicBanner,
    maintenanceMode: process.env.SKYLENT_MAINTENANCE_MODE === "true",
    ...readinessFields(),
  })
})

router.get("/ready", handleReadiness)
router.get("/", handleReadiness)

export default router
