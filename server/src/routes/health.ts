import { Router, type Request, type Response } from "express"
import { prisma } from "../lib/prisma.js"
import { checkMigrationState } from "../lib/migration-guard.js"
import { redactSecrets } from "../lib/env.js"
import { describeAiReadiness } from "../lib/skylent-ai/service.js"

const router = Router()

export const DEPLOYED_APP_VERSION = "9.2.0"
export const DEPLOYED_BUILD_ID = "v92-202611070747"

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
 * Uses a stable DEPLOYED_BUILD_ID (plus optional Admin DB override) so installed APKs
 * sync once per deployment and never get trapped in an infinite reload loop.
 */
router.get("/app-config", async (request, response) => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
  let dynamicVersion = DEPLOYED_APP_VERSION
  let dynamicBuildId = DEPLOYED_BUILD_ID
  let dynamicNotes = "Zero-delay dashboard, 5-inch adaptive layout, in-app PayU & UPI checkout."
  let dynamicAnnouncement: string | null = process.env.SKYLENT_APP_BANNER?.trim() || null

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ value: string }>>(
      `SELECT "value" FROM "_skylent_runtime_config" WHERE "key" = 'app_update_config' LIMIT 1`,
    )
    if (rows[0]?.value) {
      const parsed = JSON.parse(rows[0].value) as {
        appVersion?: string
        buildId?: string
        releaseNotes?: string
        announcement?: string
      }
      if (parsed.appVersion) dynamicVersion = parsed.appVersion
      if (parsed.buildId) dynamicBuildId = parsed.buildId
      else if (parsed.appVersion) dynamicBuildId = `v88-${parsed.appVersion}`
      if (parsed.releaseNotes) dynamicNotes = parsed.releaseNotes
      if (parsed.announcement) dynamicAnnouncement = parsed.announcement
    }
  } catch {
    // Fallback to static constants
  }

  const currentStamp = `${dynamicVersion}:${dynamicBuildId}`
  const clientInstalledStamp = typeof request.query.installedBuild === "string" ? request.query.installedBuild.trim() : ""
  const isUpToDate =
    Boolean(clientInstalledStamp) &&
    (clientInstalledStamp === currentStamp || clientInstalledStamp === dynamicBuildId)

  response.json({
    appVersion: dynamicVersion,
    minSupportedAppVersion: "1.0.0",
    autoSyncUpdate: Boolean(clientInstalledStamp) && !isUpToDate,
    buildId: dynamicBuildId,
    releaseNotes: dynamicNotes,
    updateTitle: "Updating Skylent to the latest version…",
    apkDownloadUrl: "https://skylent.live/skylent-latest.apk",
    playStoreUrl:
      process.env.SKYLENT_PLAY_STORE_URL?.trim() ||
      "https://play.google.com/store/apps/details?id=live.skylent.app",
    announcement: dynamicAnnouncement,
    maintenanceMode: process.env.SKYLENT_MAINTENANCE_MODE === "true",
    ...readinessFields(),
  })
})

router.get("/ready", handleReadiness)
router.get("/", handleReadiness)

export default router
