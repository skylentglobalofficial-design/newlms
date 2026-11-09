import { createHash } from "node:crypto"
import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { Router, type Request, type Response } from "express"
import { prisma } from "../lib/prisma.js"
import { checkMigrationState } from "../lib/migration-guard.js"
import { redactSecrets } from "../lib/env.js"
import { describeAiReadiness } from "../lib/skylent-ai/service.js"

const router = Router()
const startedAt = Date.now()

export const DEPLOYED_APP_VERSION = process.env.SKYLENT_APP_VERSION?.trim() || "10.4.0"

function computeDynamicBuildId(): string {
  if (process.env.SKYLENT_BUILD_ID?.trim()) return process.env.SKYLENT_BUILD_ID.trim()
  const gitSha = (
    process.env.SKYLENT_RELEASE_SHA ||
    process.env.RENDER_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    ""
  )
    .trim()
    .slice(0, 8)

  const candidates = [
    path.resolve(process.cwd(), "dist/index.html"),
    path.resolve(process.cwd(), "../dist/index.html"),
  ]
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) {
        const html = readFileSync(candidate, "utf8")
        const mtime = Math.floor(statSync(candidate).mtimeMs / 1000)
        const digest = createHash("sha1").update(html).digest("hex").slice(0, 10)
        return `v104-${gitSha ? `${gitSha}-` : ""}${digest}-${mtime}`
      }
    } catch {
      // ignore and fall back
    }
  }
  return `v104-${gitSha || "live"}-${Math.floor(startedAt / 1000)}`
}

export const DEPLOYED_BUILD_ID = computeDynamicBuildId()

function releaseSha(): string {
  const sha = process.env.SKYLENT_RELEASE_SHA?.trim() ?? ""
  return /^[0-9a-f]{7,40}$/i.test(sha) ? sha : computeDynamicBuildId()
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
 * Seamless Auto-Update Config for Skylent Mobile Web & Native APK builds.
 * Computes a fresh buildId on every `npm run build` / `git push` so installed APKs
 * and browsers detect new deployments within seconds and prompt/sync automatically.
 */
router.get("/app-config", async (request, response) => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  let dynamicVersion = DEPLOYED_APP_VERSION
  let dynamicBuildId = computeDynamicBuildId()
  let dynamicNotes = "Latest courses, AI lesson tutor, anti-piracy protection & mobile UI improvements are ready."
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
      if (parsed.releaseNotes) dynamicNotes = parsed.releaseNotes
      if (parsed.announcement) dynamicAnnouncement = parsed.announcement
    }
  } catch {
    // Fallback to dynamic build hash
  }

  const currentStamp = `${dynamicVersion}:${dynamicBuildId}`
  const clientInstalledStamp = typeof request.query.installedBuild === "string" ? request.query.installedBuild.trim() : ""
  const isUpToDate =
    Boolean(clientInstalledStamp) &&
    (clientInstalledStamp === currentStamp || clientInstalledStamp === dynamicBuildId)

  response.json({
    appVersion: dynamicVersion,
    minSupportedAppVersion: "10.4.0",
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

router.get("/version", (_request, response) => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
  response.json({
    ok: true,
    appVersion: DEPLOYED_APP_VERSION,
    buildId: computeDynamicBuildId(),
    minAndroidVersionCode: 10400,
    apkDownloadUrl: "/skylent-latest.apk",
  })
})

router.get("/ready", handleReadiness)
router.get("/", handleReadiness)

export default router
